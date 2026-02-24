-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MarriageStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOW', 'DIVORCED');

-- CreateEnum
CREATE TYPE "SpouseBelief" AS ENUM ('BELIEVER', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveMessageType" AS ENUM ('LEAVE_MESSAGE', 'SPECIAL_CASE');

-- AlterTable
ALTER TABLE "MinistryMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "baptizedYear" INTEGER,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "closePersonMobile" TEXT,
ADD COLUMN     "closePersonName" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "currentMinistryId" TEXT,
ADD COLUMN     "educationStatus" TEXT,
ADD COLUMN     "formerChurchName" TEXT,
ADD COLUMN     "foundationTeacherName" TEXT,
ADD COLUMN     "fromOtherChurch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaveMessage" TEXT,
ADD COLUMN     "leaveMessageBroughtDate" TIMESTAMP(3),
ADD COLUMN     "leaveMessageType" "LeaveMessageType",
ADD COLUMN     "livingAddress" TEXT,
ADD COLUMN     "marriageStatus" "MarriageStatus",
ADD COLUMN     "mobile1" TEXT,
ADD COLUMN     "mobile2" TEXT,
ADD COLUMN     "skill" TEXT,
ADD COLUMN     "spouseBelief" "SpouseBelief",
ADD COLUMN     "spouseName" TEXT,
ADD COLUMN     "work" TEXT,
ADD COLUMN     "zoneId" TEXT;

-- CreateTable
CREATE TABLE "MinistryAdmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LEADER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinistryAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinistryRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinistryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "grade" TEXT,
    "relationType" TEXT,
    "schoolYear" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MinistryAdmin_userId_ministryId_key" ON "MinistryAdmin"("userId", "ministryId");

-- CreateIndex
CREATE UNIQUE INDEX "MinistryRequest_userId_ministryId_key" ON "MinistryRequest"("userId", "ministryId");

-- AddForeignKey
ALTER TABLE "MinistryAdmin" ADD CONSTRAINT "MinistryAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryAdmin" ADD CONSTRAINT "MinistryAdmin_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryRequest" ADD CONSTRAINT "MinistryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryRequest" ADD CONSTRAINT "MinistryRequest_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_currentMinistryId_fkey" FOREIGN KEY ("currentMinistryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
