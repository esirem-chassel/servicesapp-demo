/**
 * Author:  qu0262ch
 * Created: 30 avr. 2026
 */

create table "years" (
"rowid" integer not null primary key,
"name" varchar(100) not null unique
);

create table "sections" (
"rowid" integer not null primary key,
"name" varchar(100) not null unique
);

create table "semesters" (
"rowid" integer not null primary key,
"name" varchar(100) not null unique
);

create table "proms" (
"rowid" integer not null primary key,
"yearid" integer not null,
"sectionid" integer not null,
"semesterid" integer not null,
constraint "uk_proms_year_section_semester"
unique("yearid", "sectionid", "semesterid")
);

create table "speakers" (
"rowid" integer not null primary key,
"name" varchar(200) not null,
"mail" varchar(200) default null,
"tel" varchar(50) default null
);

create table "speakermanagement" (
"speakerid" integer not null,
"yearid" integer not null,
"internal"
);

create table "uestpl" (
"rowid" integer not null primary key,
"name" varchar(200) not null,
"ects" integer not null default 0
);

create table "modulestpl" (
"rowid" integer not null primary key,
"name" varchar(200) not null,
"code" varchar(20) default null,
"ueid" integer not null,
"coeff" decimal not null,
"manager" integer default null
);
