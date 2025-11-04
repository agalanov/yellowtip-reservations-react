const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Creating tables...');

    // Create Countries table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ytr_countries" (
        "country_id" SERIAL NOT NULL,
        "country_code" CHAR(3),
        "country_name" VARCHAR(50) NOT NULL DEFAULT '',
        "toppulldown" CHAR(1) NOT NULL DEFAULT 'N',
        "country_default" CHAR(1) NOT NULL DEFAULT 'N',
        CONSTRAINT "ytr_countries_pkey" PRIMARY KEY ("country_id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ytr_countries_country_code_key" 
      ON "ytr_countries"("country_code") WHERE "country_code" IS NOT NULL;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ytr_countries_country_code_idx" 
      ON "ytr_countries"("country_code", "country_name");
    `);

    // Create Cities table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ytr_city" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(150) NOT NULL DEFAULT '',
        "country" INTEGER NOT NULL DEFAULT 0,
        "city_default" CHAR(1) NOT NULL DEFAULT 'N',
        CONSTRAINT "ytr_city_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ytr_city_name_country_idx" 
      ON "ytr_city"("name", "country");
    `);

    // Add foreign key constraint for cities if countries table exists
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'ytr_city_country_fkey'
          ) THEN
            ALTER TABLE "ytr_city" 
            ADD CONSTRAINT "ytr_city_country_fkey" 
            FOREIGN KEY ("country") 
            REFERENCES "ytr_countries"("country_id") 
            ON DELETE RESTRICT ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
    } catch (e) {
      console.log('Foreign key might already exist or countries table not found:', e.message);
    }

    // Create Taxes table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ytr_taxes" (
        "taxes_id" SERIAL NOT NULL,
        "taxes_code" VARCHAR(15) NOT NULL,
        "taxes_descr" VARCHAR(50),
        "taxes_tax1" DOUBLE PRECISION,
        "taxes_tax1_txt" VARCHAR(15),
        "taxes_tax2" DOUBLE PRECISION,
        "taxes_tax2_txt" VARCHAR(15),
        "taxes_2on1" BOOLEAN DEFAULT false,
        "taxes_real" BOOLEAN DEFAULT false,
        CONSTRAINT "ytr_taxes_pkey" PRIMARY KEY ("taxes_id")
      );
    `);

    // Create WorkTimeDay table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ytr_worktime_day" (
        "weekday" INTEGER NOT NULL,
        "starttime" INTEGER NOT NULL,
        "endtime" INTEGER NOT NULL,
        CONSTRAINT "ytr_worktime_day_pkey" PRIMARY KEY ("weekday")
      );
    `);

    // Create WorkTimeDate table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ytr_worktime_date" (
        "workdate" INTEGER NOT NULL,
        "starttime" INTEGER NOT NULL,
        "endtime" INTEGER NOT NULL,
        CONSTRAINT "ytr_worktime_date_pkey" PRIMARY KEY ("workdate")
      );
    `);

    // Create WorkTimeHoliday table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ytr_worktime_holidays" (
        "startdate" INTEGER NOT NULL,
        "enddate" INTEGER NOT NULL,
        CONSTRAINT "ytr_worktime_holidays_pkey" PRIMARY KEY ("startdate", "enddate")
      );
    `);

    // Mark migration as applied
    const migrationName = '20250102000000_add_regional_and_business_settings';
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
      SELECT gen_random_uuid(), '', NOW(), '${migrationName}', NULL, NOW(), 1
      WHERE NOT EXISTS (
        SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '${migrationName}'
      );
    `);

    console.log('✅ All tables created successfully!');
    
    // Verify tables were created
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'ytr_countries', 
        'ytr_city', 
        'ytr_taxes', 
        'ytr_worktime_day', 
        'ytr_worktime_date', 
        'ytr_worktime_holidays'
      )
      ORDER BY table_name;
    `;
    
    console.log('Created tables:', tables);
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

