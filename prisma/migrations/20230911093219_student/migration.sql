-- DropForeignKey
ALTER TABLE "College" DROP CONSTRAINT "College_studentID_fkey";

-- AlterTable
ALTER TABLE "College" ALTER COLUMN "studentID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "College" ADD CONSTRAINT "College_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
