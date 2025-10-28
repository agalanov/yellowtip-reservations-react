import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.account.upsert({
    where: { loginId: 'admin' },
    update: {},
    create: {
      loginId: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      type: 'u',
    },
  });

  console.log('✅ Admin user created:', adminUser.loginId);

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'admin',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'user',
    },
  });

  console.log('✅ Roles created');

  // Assign admin role to admin user
  await prisma.accountRole.upsert({
    where: {
      accountId_roleId: {
        accountId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      accountId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create access rights
  const accessRights = [
    { id: 1100, name: 'Add Reservations', appName: 'reservations' },
    { id: 1101, name: 'Edit Reservations', appName: 'reservations' },
    { id: 1102, name: 'Delete Reservations', appName: 'reservations' },
    { id: 1103, name: 'View Statistic', appName: 'reservations' },
    { id: 1200, name: 'Add Guest', appName: 'guests' },
    { id: 1201, name: 'Edit Guest', appName: 'guests' },
    { id: 1202, name: 'Delete Guest', appName: 'guests' },
    { id: 1300, name: 'Add Service & Package', appName: 'services' },
    { id: 1301, name: 'Edit Service & Package', appName: 'services' },
    { id: 1302, name: 'Delete Service & Package', appName: 'services' },
    { id: 1400, name: 'Add Room', appName: 'rooms' },
    { id: 1401, name: 'Edit Room', appName: 'rooms' },
    { id: 1402, name: 'Delete Room', appName: 'rooms' },
    { id: 1500, name: 'Add Therapist', appName: 'therapists' },
    { id: 1501, name: 'Edit Therapist', appName: 'therapists' },
    { id: 1502, name: 'Delete Therapist', appName: 'therapists' },
  ];

  for (const right of accessRights) {
    await prisma.accessRight.upsert({
      where: { id: right.id },
      update: {},
      create: right,
    });
  }

  // Assign all rights to admin role
  for (const right of accessRights) {
    await prisma.roleRight.upsert({
      where: {
        roleId_rightId: {
          roleId: adminRole.id,
          rightId: right.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        rightId: right.id,
      },
    });
  }

  console.log('✅ Access rights created and assigned');

  // Create default currency
  const defaultCurrency = await prisma.currency.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      isBase: true,
    },
  });

  console.log('✅ Default currency created');

  // Create default color first
  await prisma.colorTable.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Blue',
      hexCode: '007bff',
      textColor: 'ffffff',
      beforeColor: 'ffffff',
      afterColor: 'ffffff',
    },
  });

  // Create default service category
  const defaultCategory = await prisma.serviceCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'General Services',
      parentId: 0,
      status: true,
      colorId: 1,
    },
  });

  console.log('✅ Default service category created');

  // Create default room
  const defaultRoom = await prisma.room.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Room 1',
      description: 'Default room',
      priority: 5,
      active: true,
    },
  });

  console.log('✅ Default room created');

  // Create default service
  const defaultService = await prisma.service.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      categoryId: defaultCategory.id,
      currencyId: defaultCurrency.id,
      name: 'General Service',
      description: 'Default service',
      price: 50.00,
      duration: 60, // 60 minutes
      preDuration: 0,
      postDuration: 0,
      space: 1,
      therapistType: '1',
      active: true,
      roomType: '1',
      variableTime: false,
      variablePrice: false,
      minimalTime: 5,
      maximalTime: 0,
      timeUnit: 5,
    },
  });

  console.log('✅ Default service created');

  // Link room and service
  await prisma.roomService.upsert({
    where: {
      roomId_serviceId: {
        roomId: defaultRoom.id,
        serviceId: defaultService.id,
      },
    },
    update: {},
    create: {
      roomId: defaultRoom.id,
      serviceId: defaultService.id,
    },
  });

  console.log('✅ Room and service linked');

  // Create default guest
  const defaultGuest = await prisma.guest.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      firstLetter: 'D',
    },
  });

  console.log('✅ Default guest created');

  // Create default therapist
  const defaultTherapist = await prisma.therapist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      firstLetter: 'S',
      priority: 5,
    },
  });

  console.log('✅ Default therapist created');

  // Link therapist and service
  await prisma.therapistService.upsert({
    where: {
      therapistId_serviceId: {
        therapistId: defaultTherapist.id,
        serviceId: defaultService.id,
      },
    },
    update: {},
    create: {
      therapistId: defaultTherapist.id,
      serviceId: defaultService.id,
    },
  });

  console.log('✅ Therapist and service linked');

  // Create default language
  await prisma.language.upsert({
    where: { id: 'en' },
    update: {},
    create: {
      id: 'en',
      name: 'English',
      available: true,
      availableGuests: true,
      availableReservations: true,
      isDefault: true,
    },
  });

  console.log('✅ Default language created');

  // Create default payment types
  const paymentTypes = [
    { id: 1, name: 'Cash', undeleteable: true },
    { id: 2, name: 'Credit Card', undeleteable: false },
    { id: 3, name: 'Bank Transfer', undeleteable: false },
  ];

  for (const paymentType of paymentTypes) {
    await prisma.paymentType.upsert({
      where: { id: paymentType.id },
      update: {},
      create: paymentType,
    });
  }

  console.log('✅ Payment types created');

  // Create default cancellation reasons
  const cancellationReasons = [
    { id: 1, name: 'Client cancelled' },
    { id: 2, name: 'No show' },
    { id: 3, name: 'Emergency' },
    { id: 4, name: 'Weather' },
  ];

  for (const reason of cancellationReasons) {
    await prisma.cancellationReason.upsert({
      where: { id: reason.id },
      update: {},
      create: reason,
    });
  }

  console.log('✅ Cancellation reasons created');

  // Create default work time reasons
  const workTimeReasons = [
    { id: 1, name: 'Regular work' },
    { id: 2, name: 'Overtime' },
    { id: 3, name: 'Training' },
  ];

  for (const reason of workTimeReasons) {
    await prisma.workTimeReason.upsert({
      where: { id: reason.id },
      update: {},
      create: reason,
    });
  }

  console.log('✅ Work time reasons created');

  // Create default holiday reasons
  const holidayReasons = [
    { id: 1, name: 'Vacation' },
    { id: 2, name: 'Sick leave' },
    { id: 3, name: 'Personal' },
  ];

  for (const reason of holidayReasons) {
    await prisma.holidayReason.upsert({
      where: { id: reason.id },
      update: {},
      create: reason,
    });
  }

  console.log('✅ Holiday reasons created');

  // Create default guest attribute names
  const guestAttributeNames = [
    { id: 1, type: 'text', name: 'Phone', priority: 1, showInResults: true, enabled: true },
    { id: 2, type: 'text', name: 'Email', priority: 2, showInResults: true, enabled: true },
    { id: 3, type: 'text', name: 'Address', priority: 3, showInResults: false, enabled: true },
    { id: 4, type: 'select', name: 'Country', priority: 4, showInResults: true, enabled: true },
    { id: 5, type: 'text', name: 'Notes', priority: 5, showInResults: false, enabled: true },
  ];

  for (const attribute of guestAttributeNames) {
    await prisma.guestAttributeName.upsert({
      where: { id: attribute.id },
      update: {},
      create: attribute,
    });
  }

  console.log('✅ Guest attribute names created');

  // Create default therapist attribute names
  const therapistAttributeNames = [
    { id: 1, type: 'text', name: 'Phone', priority: 1, showInResults: true },
    { id: 2, type: 'text', name: 'Email', priority: 2, showInResults: true },
    { id: 3, type: 'text', name: 'Address', priority: 3, showInResults: false },
    { id: 4, type: 'select', name: 'Country', priority: 4, showInResults: true },
    { id: 5, type: 'text', name: 'Specialization', priority: 5, showInResults: true },
    { id: 6, type: 'text', name: 'Experience', priority: 6, showInResults: false },
    { id: 7, type: 'text', name: 'Certification', priority: 7, showInResults: false },
    { id: 8, type: 'select', name: 'Gender', priority: 8, showInResults: true },
    { id: 9, type: 'select', name: 'Language', priority: 9, showInResults: true },
    { id: 10, type: 'text', name: 'Bio', priority: 10, showInResults: false },
    { id: 11, type: 'select', name: 'Qualification', priority: 11, showInResults: true },
    { id: 12, type: 'select', name: 'Department', priority: 12, showInResults: true },
  ];

  for (const attribute of therapistAttributeNames) {
    await prisma.therapistAttributeName.upsert({
      where: { id: attribute.id },
      update: {},
      create: attribute,
    });
  }

  console.log('✅ Therapist attribute names created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
