CREATE TABLE IF NOT EXISTS mysqldb.accounts(
    `id` int AUTO_INCREMENT PRIMARY KEY,
    `email` varchar(255) not null,
    `password` varchar(64) not null,
    `emailVerifiedAt` datetime default null,
    `verifyExpiredAt` datetime default null,
    `createdAt` datetime not null,
    `updatedAt` datetime not null,
    `loginKey` varchar(255) default null,
    `state` int not null
);