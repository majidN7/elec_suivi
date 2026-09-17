-- DropForeignKey
ALTER TABLE "agent_assignments" DROP CONSTRAINT "agent_assignments_bureauVoteId_fkey";

-- DropForeignKey
ALTER TABLE "agent_assignments" DROP CONSTRAINT "agent_assignments_userId_fkey";

-- DropTable
DROP TABLE "agent_assignments";

