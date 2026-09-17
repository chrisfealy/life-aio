-- Accounts concept removed: finance now tracks a single undifferentiated pool of transactions.
alter table transactions drop column account_id;
drop table finance_accounts;
