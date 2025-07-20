-- CreateTable
CREATE TABLE "TelegramLinkRequest" (
    "code" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TelegramLinkRequest_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "TelegramLinkRequest" ADD CONSTRAINT "TelegramLinkRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
