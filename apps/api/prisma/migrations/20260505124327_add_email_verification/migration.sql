-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verify_code" TEXT,
ADD COLUMN     "email_verify_expiry" TIMESTAMP(3);
