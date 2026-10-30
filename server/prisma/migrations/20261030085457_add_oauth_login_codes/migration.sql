-- CreateTable
CREATE TABLE "OAuthLoginCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthLoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthLoginCode_codeHash_key" ON "OAuthLoginCode"("codeHash");
