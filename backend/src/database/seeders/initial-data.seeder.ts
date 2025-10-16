import { DataSource } from 'typeorm';
import { Shift } from '../../modules/shifts/entities/shift.entity';

import { UserRole } from '../../common/enums';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/audit/entities/user.entity';

export async function seedInitialData(dataSource: DataSource) {
    console.log('🌱 Starting database seeding...\n');

    // Seed Shifts
    console.log('📅 Seeding shifts...');
    const shiftRepository = dataSource.getRepository(Shift);

    const shifts = [
        {
            name: 'Morning Shift',
            startTime: '06:00',
            endTime: '14:00',
            gracePeriodMinutes: 15,
            description: 'Early morning operations shift',
            colorCode: '#3B82F6',
            isActive: true,
        },
        {
            name: 'Afternoon Shift',
            startTime: '14:00',
            endTime: '22:00',
            gracePeriodMinutes: 15,
            description: 'Afternoon to evening operations shift',
            colorCode: '#F59E0B',
            isActive: true,
        },
        {
            name: 'Night Shift',
            startTime: '22:00',
            endTime: '06:00',
            gracePeriodMinutes: 15,
            description: 'Night operations and security shift',
            colorCode: '#8B5CF6',
            isActive: true,
        },
        {
            name: 'Day Shift (9-5)',
            startTime: '09:00',
            endTime: '17:00',
            gracePeriodMinutes: 15,
            description: 'Standard day shift for administrative staff',
            colorCode: '#10B981',
            isActive: true,
        },
    ];

    for (const shiftData of shifts) {
        const existingShift = await shiftRepository.findOne({
            where: { name: shiftData.name },
        });

        if (!existingShift) {
            const shift = shiftRepository.create(shiftData);
            await shiftRepository.save(shift);
            console.log(`  ✓ Created shift: ${shiftData.name}`);
        } else {
            console.log(`  - Shift already exists: ${shiftData.name}`);
        }
    }

    // Seed Admin Users
    console.log('\n👤 Seeding admin users...');
    const userRepository = dataSource.getRepository(User);

    const users = [
        {
            username: 'superadmin',
            email: 'superadmin@attendance.local',
            password: await bcrypt.hash('SuperAdmin@123', 10),
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            isActive: true,
        },
        {
            username: 'admin',
            email: 'admin@attendance.local',
            password: await bcrypt.hash('Admin@123', 10),
            firstName: 'System',
            lastName: 'Administrator',
            role: UserRole.ADMIN,
            isActive: true,
        },
    ];

    for (const userData of users) {
        const existingUser = await userRepository.findOne({
            where: { username: userData.username },
        });

        if (!existingUser) {
            const user = userRepository.create(userData);
            await userRepository.save(user);
            console.log(`  ✓ Created user: ${userData.username} (${userData.email})`);
            console.log(`    Password: ${userData.username === 'superadmin' ? 'SuperAdmin@123' : 'Admin@123'}`);
        } else {
            console.log(`  - User already exists: ${userData.username}`);
        }
    }

    console.log('\n✅ Database seeding completed!\n');
    console.log('📝 Default credentials:');
    console.log('   Super Admin: superadmin / SuperAdmin@123');
    console.log('   Admin: admin / Admin@123\n');
}

// CLI runner
if (require.main === module) {
    const { DataSource } = require('typeorm');
    require('dotenv').config();

    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'attendance123',
        database: process.env.DB_NAME ?? 'attendance_system',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: false,
    });

    AppDataSource.initialize()
        .then(async () => {
            await seedInitialData(AppDataSource);
            await AppDataSource.destroy();
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error during seeding:', error);
            process.exit(1);
        });
}