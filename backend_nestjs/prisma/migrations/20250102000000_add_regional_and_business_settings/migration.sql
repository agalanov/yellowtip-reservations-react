-- CreateTable: Countries (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_countries') THEN
        CREATE TABLE "ytr_countries" (
            "country_id" SERIAL NOT NULL,
            "country_code" CHAR(3),
            "country_name" VARCHAR(50) NOT NULL DEFAULT '',
            "toppulldown" CHAR(1) NOT NULL DEFAULT 'N',
            "country_default" CHAR(1) NOT NULL DEFAULT 'N',

            CONSTRAINT "ytr_countries_pkey" PRIMARY KEY ("country_id")
        );

        CREATE UNIQUE INDEX "ytr_countries_country_name_key" ON "ytr_countries"("country_name");
        CREATE INDEX "ytr_countries_country_code_idx" ON "ytr_countries"("country_code", "country_name");
        CREATE INDEX "ytr_countries_toppulldown_idx" ON "ytr_countries"("toppulldown");
        CREATE INDEX "ytr_countries_country_default_idx" ON "ytr_countries"("country_default");
        
        -- Add unique constraint for country_code if column exists
        CREATE UNIQUE INDEX IF NOT EXISTS "ytr_countries_country_code_key" ON "ytr_countries"("country_code") WHERE "country_code" IS NOT NULL;
    END IF;
END $$;

-- CreateTable: Cities (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_city') THEN
        CREATE TABLE "ytr_city" (
            "id" SERIAL NOT NULL,
            "name" VARCHAR(150) NOT NULL DEFAULT '',
            "country" INTEGER NOT NULL DEFAULT 0,
            "city_default" CHAR(1) NOT NULL DEFAULT 'N',

            CONSTRAINT "ytr_city_pkey" PRIMARY KEY ("id")
        );

        CREATE INDEX "ytr_city_name_country_idx" ON "ytr_city"("name", "country");
        
        -- Add foreign key if countries table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_countries') THEN
            ALTER TABLE "ytr_city" ADD CONSTRAINT "ytr_city_country_fkey" FOREIGN KEY ("country") REFERENCES "ytr_countries"("country_id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- CreateTable: Taxes (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_taxes') THEN
        CREATE TABLE "ytr_taxes" (
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
    END IF;
END $$;

-- Languages table already exists in migration 20251028155325_0_1, so we skip it

-- CreateTable: WorkTimeDay (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_worktime_day') THEN
        CREATE TABLE "ytr_worktime_day" (
            "weekday" INTEGER NOT NULL,
            "starttime" INTEGER NOT NULL,
            "endtime" INTEGER NOT NULL,

            CONSTRAINT "ytr_worktime_day_pkey" PRIMARY KEY ("weekday")
        );
    END IF;
END $$;

-- CreateTable: WorkTimeDate (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_worktime_date') THEN
        CREATE TABLE "ytr_worktime_date" (
            "workdate" INTEGER NOT NULL,
            "starttime" INTEGER NOT NULL,
            "endtime" INTEGER NOT NULL,

            CONSTRAINT "ytr_worktime_date_pkey" PRIMARY KEY ("workdate")
        );
    END IF;
END $$;

-- CreateTable: WorkTimeHoliday (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ytr_worktime_holidays') THEN
        CREATE TABLE "ytr_worktime_holidays" (
            "startdate" INTEGER NOT NULL,
            "enddate" INTEGER NOT NULL,

            CONSTRAINT "ytr_worktime_holidays_pkey" PRIMARY KEY ("startdate", "enddate")
        );
    END IF;
END $$;

