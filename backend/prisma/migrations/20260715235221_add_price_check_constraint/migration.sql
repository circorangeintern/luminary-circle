ALTER TABLE "price_submissions"
ADD CONSTRAINT "chk_price_positive" CHECK ("price" > 0);