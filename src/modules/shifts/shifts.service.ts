import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto, UpdateShiftDto } from './dto/create-shift.dto';

@Injectable()
export class ShiftsService {
    constructor(
        @InjectRepository(Shift)
        private readonly shiftsRepository: Repository<Shift>,
    ) { }

    async create(createShiftDto: CreateShiftDto): Promise<Shift> {
        // Check if shift name already exists
        const existingShift = await this.shiftsRepository.findOne({
            where: { name: createShiftDto.name },
        });

        if (existingShift) {
            throw new ConflictException(
                `Shift with name "${createShiftDto.name}" already exists`,
            );
        }

        // Validate time logic
        this.validateShiftTimes(createShiftDto.startTime, createShiftDto.endTime);

        const shift = this.shiftsRepository.create({
            ...createShiftDto,
            gracePeriodMinutes: createShiftDto.gracePeriodMinutes ?? 15,
        });

        return this.shiftsRepository.save(shift);
    }

    async findAll(): Promise<Shift[]> {
        return this.shiftsRepository.find({
            order: { startTime: 'ASC' },
        });
    }

    async findActive(): Promise<Shift[]> {
        return this.shiftsRepository.find({
            where: { isActive: true },
            order: { startTime: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Shift> {
        const shift = await this.shiftsRepository.findOne({
            where: { id },
            relations: ['employees'],
        });

        if (!shift) {
            throw new NotFoundException(`Shift with ID "${id}" not found`);
        }

        return shift;
    }

    async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
        const shift = await this.findOne(id);

        // If updating times, validate them
        if (updateShiftDto.startTime || updateShiftDto.endTime) {
            const startTime = updateShiftDto.startTime || shift.startTime;
            const endTime = updateShiftDto.endTime || shift.endTime;
            this.validateShiftTimes(startTime, endTime);
        }

        // Check for name conflict if name is being updated
        if (updateShiftDto.name && updateShiftDto.name !== shift.name) {
            const existingShift = await this.shiftsRepository.findOne({
                where: { name: updateShiftDto.name },
            });

            if (existingShift) {
                throw new ConflictException(
                    `Shift with name "${updateShiftDto.name}" already exists`,
                );
            }
        }

        Object.assign(shift, updateShiftDto);
        return this.shiftsRepository.save(shift);
    }

    async remove(id: string): Promise<void> {
        const shift = await this.findOne(id);

        // Check if shift has employees
        if (shift.employees && shift.employees.length > 0) {
            throw new BadRequestException(
                `Cannot delete shift "${shift.name}" because it has ${shift.employees.length} assigned employee(s). Reassign employees first.`,
            );
        }

        await this.shiftsRepository.remove(shift);
    }

    async toggleActive(id: string): Promise<Shift> {
        const shift = await this.findOne(id);
        shift.isActive = !shift.isActive;
        return this.shiftsRepository.save(shift);
    }

    async getCurrentShift(): Promise<Shift | null> {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const shifts = await this.findActive();

        // Find shift where current time is between start and end
        for (const shift of shifts) {
            if (currentTime >= shift.startTime && currentTime <= shift.endTime) {
                return shift;
            }
        }

        return null;
    }

    // In shifts.service.ts

    private validateShiftTimes(startTime: string, endTime: string): void {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);

        // Calculate duration, accounting for overnight shifts
        let durationMinutes: number;
        if (end < start) {
            // Overnight shift (crosses midnight)
            durationMinutes = (24 * 60 - start) + end;
        } else if (end === start) {
            throw new BadRequestException(
                'Shift start and end times cannot be the same',
            );
        } else {
            // Same-day shift
            durationMinutes = end - start;
        }

        // Ensure minimum shift duration (e.g., 4 hours)
        const minDurationMinutes = 240; // 4 hours
        if (durationMinutes < minDurationMinutes) {
            throw new BadRequestException(
                'Shift duration must be at least 4 hours',
            );
        }

        // Ensure maximum shift duration (e.g., 12 hours)
        const maxDurationMinutes = 720; // 12 hours
        if (durationMinutes > maxDurationMinutes) {
            throw new BadRequestException(
                'Shift duration cannot exceed 12 hours',
            );
        }
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}