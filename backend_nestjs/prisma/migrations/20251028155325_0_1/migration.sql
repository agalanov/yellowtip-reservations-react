-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('A', 'L');

-- CreateTable
CREATE TABLE "ytr_accounts" (
    "id" SERIAL NOT NULL,
    "account_lid" TEXT NOT NULL,
    "account_pwd" TEXT NOT NULL,
    "account_firstname" TEXT,
    "account_lastname" TEXT,
    "account_lastlogin" INTEGER,
    "account_lastloginfrom" TEXT,
    "account_lastpwd_change" INTEGER,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'A',
    "account_expires" INTEGER,
    "account_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_departments" (
    "department_id" SERIAL NOT NULL,
    "department_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "ytr_accounts_departments" (
    "account_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "ytr_accounts_departments_pkey" PRIMARY KEY ("account_id","department_id")
);

-- CreateTable
CREATE TABLE "ytr_roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "ytr_accounts_roles" (
    "account_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "ytr_accounts_roles_pkey" PRIMARY KEY ("account_id","role_id")
);

-- CreateTable
CREATE TABLE "ytr_access_rights" (
    "right_id" SERIAL NOT NULL,
    "right_name" TEXT NOT NULL,
    "app_name" TEXT NOT NULL,

    CONSTRAINT "ytr_access_rights_pkey" PRIMARY KEY ("right_id")
);

-- CreateTable
CREATE TABLE "ytr_roles_rights" (
    "role_id" INTEGER NOT NULL,
    "right_id" INTEGER NOT NULL,

    CONSTRAINT "ytr_roles_rights_pkey" PRIMARY KEY ("role_id","right_id")
);

-- CreateTable
CREATE TABLE "ytr_sessions" (
    "session_id" TEXT NOT NULL,
    "session_lid" TEXT,
    "session_ip" TEXT,
    "session_logintime" INTEGER,
    "session_dla" INTEGER,
    "session_action" TEXT,
    "session_flags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "ytr_room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "respriority" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_service" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "currency" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "duration" INTEGER,
    "preduration" INTEGER NOT NULL DEFAULT 0,
    "postduration" INTEGER NOT NULL DEFAULT 0,
    "space" INTEGER NOT NULL DEFAULT 1,
    "therapisttype" TEXT NOT NULL DEFAULT '1',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "roomtype" TEXT NOT NULL DEFAULT '1',
    "variabletime" BOOLEAN NOT NULL DEFAULT false,
    "variableprice" BOOLEAN NOT NULL DEFAULT false,
    "minimaltime" INTEGER NOT NULL DEFAULT 5,
    "maximaltime" INTEGER NOT NULL DEFAULT 0,
    "timeunit" INTEGER NOT NULL DEFAULT 5,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_servicecategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "color" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_servicecategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_colortable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hexcode" TEXT NOT NULL,
    "textcolor" TEXT NOT NULL,
    "beforecolor" TEXT NOT NULL DEFAULT 'FFFFFF',
    "aftercolor" TEXT NOT NULL DEFAULT 'FFFFFF',

    CONSTRAINT "ytr_colortable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_currency" (
    "id" SERIAL NOT NULL,
    "currency_code" TEXT NOT NULL,
    "currency_name" TEXT NOT NULL,
    "currency_symbol" TEXT NOT NULL,
    "base" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_room_service" (
    "room_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "ytr_room_service_pkey" PRIMARY KEY ("room_id","service_id")
);

-- CreateTable
CREATE TABLE "ytr_room_servicecategory" (
    "room" INTEGER NOT NULL,
    "servicecategory" INTEGER NOT NULL,

    CONSTRAINT "ytr_room_servicecategory_pkey" PRIMARY KEY ("room","servicecategory")
);

-- CreateTable
CREATE TABLE "ytr_guest" (
    "id" SERIAL NOT NULL,
    "firstletter" TEXT,
    "lastname" TEXT,
    "firstname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_guest_guest_attributename" (
    "id" SERIAL NOT NULL,
    "guest" INTEGER NOT NULL,
    "guestattributename" INTEGER NOT NULL,
    "multipleattribute" INTEGER NOT NULL DEFAULT 0,
    "value" TEXT,

    CONSTRAINT "ytr_guest_guest_attributename_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_guestattributename" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "name" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "showinresults" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ytr_guestattributename_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_therapist" (
    "id" SERIAL NOT NULL,
    "firstletter" TEXT,
    "lastname" TEXT,
    "firstname" TEXT,
    "respriority" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_therapist_therapistattrib" (
    "id" SERIAL NOT NULL,
    "therapist" INTEGER NOT NULL,
    "therapistattributename" INTEGER NOT NULL,
    "multipleattribute" INTEGER NOT NULL DEFAULT 0,
    "value" TEXT,

    CONSTRAINT "ytr_therapist_therapistattrib_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_therapistattributename" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "name" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "showinresults" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ytr_therapistattributename_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_therapist_service" (
    "therapist_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "ytr_therapist_service_pkey" PRIMARY KEY ("therapist_id","service_id")
);

-- CreateTable
CREATE TABLE "ytr_therapistworktime" (
    "weekday" INTEGER NOT NULL,
    "therapist" INTEGER NOT NULL,
    "workdate" INTEGER NOT NULL,
    "starttime" INTEGER,
    "endtime" INTEGER,
    "worktimereason" INTEGER NOT NULL,

    CONSTRAINT "ytr_therapistworktime_pkey" PRIMARY KEY ("weekday","therapist","workdate")
);

-- CreateTable
CREATE TABLE "ytr_worktimereason" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ytr_worktimereason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_therapistholidays" (
    "holidaytype" SERIAL NOT NULL,
    "therapist" INTEGER NOT NULL,
    "startdate" INTEGER,
    "enddate" INTEGER,
    "holidayreason" INTEGER NOT NULL,

    CONSTRAINT "ytr_therapistholidays_pkey" PRIMARY KEY ("holidaytype")
);

-- CreateTable
CREATE TABLE "ytr_holidayreason" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ytr_holidayreason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_booking" (
    "id" SERIAL NOT NULL,
    "date" INTEGER NOT NULL,
    "service" INTEGER NOT NULL,
    "servicepackage" INTEGER,
    "time" INTEGER NOT NULL,
    "room" INTEGER NOT NULL,
    "guest" INTEGER NOT NULL,
    "therapist" INTEGER,
    "confirm" BOOLEAN NOT NULL DEFAULT false,
    "cancell" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "cancellreason" INTEGER,
    "preduration" INTEGER NOT NULL DEFAULT 0,
    "postduration" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "locker" TEXT NOT NULL DEFAULT '',
    "note" INTEGER,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancelldiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clipboard_owner" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ytr_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_booking_note" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "ytr_booking_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_cancellationreason" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ytr_cancellationreason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_booking_payment" (
    "booking" INTEGER NOT NULL,
    "paymenttype" INTEGER NOT NULL,
    "voucher" INTEGER,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ytr_booking_payment_pkey" PRIMARY KEY ("booking","paymenttype")
);

-- CreateTable
CREATE TABLE "ytr_paymenttype" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "undeleteable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ytr_paymenttype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_voucher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ytr_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_booking_invoice" (
    "booking" INTEGER NOT NULL,
    "includevat" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ytr_booking_invoice_pkey" PRIMARY KEY ("booking")
);

-- CreateTable
CREATE TABLE "ytr_booking_log" (
    "id" SERIAL NOT NULL,
    "booking" INTEGER NOT NULL,
    "account" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'Edit',
    "date" INTEGER NOT NULL,

    CONSTRAINT "ytr_booking_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ytr_logs" (
    "log_id" SERIAL NOT NULL,
    "message" TEXT,
    "date" INTEGER,
    "account_id" INTEGER,
    "entity_type" TEXT,
    "comment" TEXT,
    "entity_id" INTEGER NOT NULL,

    CONSTRAINT "ytr_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "ytr_languages" (
    "lang_id" TEXT NOT NULL,
    "lang_name" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "available_guests" BOOLEAN NOT NULL DEFAULT false,
    "available_reservations" BOOLEAN NOT NULL DEFAULT false,
    "lang_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ytr_languages_pkey" PRIMARY KEY ("lang_id")
);

-- CreateTable
CREATE TABLE "ytr_config" (
    "config_app" TEXT,
    "config_name" TEXT NOT NULL,
    "config_value" TEXT,

    CONSTRAINT "ytr_config_pkey" PRIMARY KEY ("config_name")
);

-- CreateIndex
CREATE UNIQUE INDEX "ytr_accounts_account_lid_key" ON "ytr_accounts"("account_lid");

-- CreateIndex
CREATE UNIQUE INDEX "ytr_guest_guest_attributename_guest_guestattributename_mult_key" ON "ytr_guest_guest_attributename"("guest", "guestattributename", "multipleattribute");

-- CreateIndex
CREATE UNIQUE INDEX "ytr_therapist_therapistattrib_therapist_therapistattributen_key" ON "ytr_therapist_therapistattrib"("therapist", "therapistattributename", "multipleattribute");

-- AddForeignKey
ALTER TABLE "ytr_accounts_departments" ADD CONSTRAINT "ytr_accounts_departments_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ytr_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_accounts_departments" ADD CONSTRAINT "ytr_accounts_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "ytr_departments"("department_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_accounts_roles" ADD CONSTRAINT "ytr_accounts_roles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ytr_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_accounts_roles" ADD CONSTRAINT "ytr_accounts_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ytr_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_roles_rights" ADD CONSTRAINT "ytr_roles_rights_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ytr_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_roles_rights" ADD CONSTRAINT "ytr_roles_rights_right_id_fkey" FOREIGN KEY ("right_id") REFERENCES "ytr_access_rights"("right_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_sessions" ADD CONSTRAINT "ytr_sessions_session_lid_fkey" FOREIGN KEY ("session_lid") REFERENCES "ytr_accounts"("account_lid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_service" ADD CONSTRAINT "ytr_service_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ytr_servicecategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_service" ADD CONSTRAINT "ytr_service_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ytr_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_servicecategory" ADD CONSTRAINT "ytr_servicecategory_color_fkey" FOREIGN KEY ("color") REFERENCES "ytr_colortable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_room_service" ADD CONSTRAINT "ytr_room_service_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "ytr_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_room_service" ADD CONSTRAINT "ytr_room_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "ytr_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_room_servicecategory" ADD CONSTRAINT "ytr_room_servicecategory_room_fkey" FOREIGN KEY ("room") REFERENCES "ytr_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_room_servicecategory" ADD CONSTRAINT "ytr_room_servicecategory_servicecategory_fkey" FOREIGN KEY ("servicecategory") REFERENCES "ytr_servicecategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_guest_guest_attributename" ADD CONSTRAINT "ytr_guest_guest_attributename_guest_fkey" FOREIGN KEY ("guest") REFERENCES "ytr_guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_guest_guest_attributename" ADD CONSTRAINT "ytr_guest_guest_attributename_guestattributename_fkey" FOREIGN KEY ("guestattributename") REFERENCES "ytr_guestattributename"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapist_therapistattrib" ADD CONSTRAINT "ytr_therapist_therapistattrib_therapist_fkey" FOREIGN KEY ("therapist") REFERENCES "ytr_therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapist_therapistattrib" ADD CONSTRAINT "ytr_therapist_therapistattrib_therapistattributename_fkey" FOREIGN KEY ("therapistattributename") REFERENCES "ytr_therapistattributename"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapist_service" ADD CONSTRAINT "ytr_therapist_service_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "ytr_therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapist_service" ADD CONSTRAINT "ytr_therapist_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "ytr_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapistworktime" ADD CONSTRAINT "ytr_therapistworktime_therapist_fkey" FOREIGN KEY ("therapist") REFERENCES "ytr_therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapistworktime" ADD CONSTRAINT "ytr_therapistworktime_worktimereason_fkey" FOREIGN KEY ("worktimereason") REFERENCES "ytr_worktimereason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapistholidays" ADD CONSTRAINT "ytr_therapistholidays_therapist_fkey" FOREIGN KEY ("therapist") REFERENCES "ytr_therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_therapistholidays" ADD CONSTRAINT "ytr_therapistholidays_holidayreason_fkey" FOREIGN KEY ("holidayreason") REFERENCES "ytr_holidayreason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking" ADD CONSTRAINT "ytr_booking_service_fkey" FOREIGN KEY ("service") REFERENCES "ytr_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking" ADD CONSTRAINT "ytr_booking_room_fkey" FOREIGN KEY ("room") REFERENCES "ytr_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking" ADD CONSTRAINT "ytr_booking_guest_fkey" FOREIGN KEY ("guest") REFERENCES "ytr_guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking" ADD CONSTRAINT "ytr_booking_therapist_fkey" FOREIGN KEY ("therapist") REFERENCES "ytr_therapist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking" ADD CONSTRAINT "ytr_booking_cancellreason_fkey" FOREIGN KEY ("cancellreason") REFERENCES "ytr_cancellationreason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking" ADD CONSTRAINT "ytr_booking_note_fkey" FOREIGN KEY ("note") REFERENCES "ytr_booking_note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking_payment" ADD CONSTRAINT "ytr_booking_payment_booking_fkey" FOREIGN KEY ("booking") REFERENCES "ytr_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking_payment" ADD CONSTRAINT "ytr_booking_payment_paymenttype_fkey" FOREIGN KEY ("paymenttype") REFERENCES "ytr_paymenttype"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking_payment" ADD CONSTRAINT "ytr_booking_payment_voucher_fkey" FOREIGN KEY ("voucher") REFERENCES "ytr_voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking_invoice" ADD CONSTRAINT "ytr_booking_invoice_booking_fkey" FOREIGN KEY ("booking") REFERENCES "ytr_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking_log" ADD CONSTRAINT "ytr_booking_log_booking_fkey" FOREIGN KEY ("booking") REFERENCES "ytr_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_booking_log" ADD CONSTRAINT "ytr_booking_log_account_fkey" FOREIGN KEY ("account") REFERENCES "ytr_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ytr_logs" ADD CONSTRAINT "ytr_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ytr_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
