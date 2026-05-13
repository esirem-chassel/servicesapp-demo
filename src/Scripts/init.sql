
create table "speaker_default_management" (
"speakerid" integer not null, -- => user(id)
"internal" integer not null default 1, -- bool
"manager" text not null,
primary key("speakerid"),
constraint "fk_speakerdefmgm_speakerid"
foreign key ("speakerid")
references "users"("id")
);

create table "teaching_module_supervisors" (
"teaching_module" integer not null,
"session" integer not null,
"supervisor" int default null,
"internal" integer not null default 1,
"manager" text not null,
primary key("teaching_module", "session"),
constraint "fk_teachingmodsup_teachingmodule"
foreign key ("teaching_module")
references "teaching_modules"("id"),
constraint "fk_teachingmodsup_session"
foreign key ("session")
references "sessions"("id"),
constraint "fk_teachingmodsup_supervisor"
foreign key ("supervisor")
references "users"("id")
);

create table "default_reparts" (
"teaching_module" integer not null,
"mode" varchar(5) not null, -- enum CM,TD,TP,CI,Projet
"nb" double not null default 0, -- seances
"timeby" double not null, -- per seance (min)
"groups" integer not null default 1, -- nb groups
primary key("teaching_module", "mode"),
primary key("teaching_module", "session"),
constraint "fk_defreparts_teachingmodule"
foreign key ("teaching_module")
references "teaching_modules"("id")
);

create table "reparts" (
"teaching_module" integer not null,
"session" integer not null,
"mode" varchar(5) not null,
"nb" double not null default 0,
"timeby" double not null,
"groups" integer not null default 1,
primary key("teaching_module", "session", "mode"),
constraint "fk_reparts_teachingmodule"
foreign key ("teaching_module")
references "teaching_modules"("id"),
constraint "fk_reparts_session"
foreign key ("session")
references "sessions"("id")
);

create table "speaks" (
"teaching_module" integer not null,
"session" integer not null,
"mode" varchar(5) not null,
"speaker" int default null,
"hours" double not null default 0,
"internal" integer not null default 1,
"manager" text not null,
primary key("module", "mode", "speaker"),
constraint "fk_speaks_teachingmodule"
foreign key ("teaching_module")
references "teaching_modules"("id"),
constraint "fk_speaks_session"
foreign key ("session")
references "sessions"("id"),
constraint "fk_speaks_speaker"
foreign key ("speaker")
references "users"("id")
);

-- @TODO : créer procédure recopie intervenants Y+1 = Y




