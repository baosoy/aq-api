create table aq_readings (
    id SERIAL primary key not null,
    uid varchar(255) not null,
    nickname varchar(255) not null,
    model varchar(20) not null,
    timestamp timestamp not null default now(),
    temperature float,
    humidity float,
    pressure float,
    noise float,
    pm1 float,
    pm2_5 float,
    pm10 float,
    voltage float
);