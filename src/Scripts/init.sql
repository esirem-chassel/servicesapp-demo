
create table `speakers_management` (
`session_id` int unsigned not null,
`semester_id` int unsigned not null,
`user_id` int unsigned not null,
`internal` boolean not null default 1,
`manager` text not null,
`last_modified` datetime not null,
`last_factored` datetime default null,
primary key(`session_id`, `semester_id`, `user_id`),
constraint `fk_speakers_mgmt_session`
foreign key (`session_id`)
references `sessions`(`id`) on delete cascade on update cascade,
constraint `fk_speakers_mgmt_semester`
foreign key (`semester_id`)
references `semesters`(`id`) on delete cascade on update cascade,
constraint `fk_speakers_mgmt_user`
foreign key (`user_id`)
references `users`(`id`) on delete cascade on update cascade
);

create table `teaching_module_supervisors` (
`session_id` int unsigned not null,
`teaching_module_id` int unsigned not null,
`supervisor_id` int unsigned default null,
`internal` boolean not null default 1,
`manager` text not null,
primary key(`session_id`, `teaching_module_id`),
constraint `fk_teachingmodsup_session`
foreign key (`session_id`)
references `sessions`(`id`) on delete cascade on update cascade,
constraint `fk_teachingmodsup_teachingmodule`
foreign key (`teaching_module_id`)
references `teaching_modules`(`id`) on delete cascade on update cascade,
constraint `fk_teachingmodsup_supervisor`
foreign key (`supervisor_id`)
references `users`(`id`) on delete cascade on update cascade
);

create table `speakmodes` (
`id` int unsigned primary key auto_increment,
`name` varchar(10) not null unique,
`eqtd` double not null default 1,
`orderix` int unsigned not null unique,
`created_at` timestamp not null,
`updated_at` timestamp not null
);

create table `default_reparts` (
`teaching_module_id` int unsigned not null,
`mode_id` int unsigned not null,
`nb` double not null default 0,
`timeby` double not null,
`groups` int unsigned not null default 1,
primary key(`teaching_module_id`, `mode_id`),
constraint `fk_default_reparts_teachingmodule`
foreign key (`teaching_module_id`)
references `teaching_modules`(`id`) on delete cascade on update cascade,
constraint `fk_default_reparts_mode`
foreign key (`mode_id`)
references `speakmodes`(`id`) on delete restrict on update cascade
);

-- notice : if multiple inputs for same session+mode in same teaching_sharing, `merge` those in saghe view
create table `reparts` (
`session_id` int unsigned not null,
`teaching_module_id` int unsigned not null,
`mode_id` int unsigned not null,
`nb` double not null default 0,
`timeby` double not null,
`groups` int unsigned not null default 1,
`last_modified` datetime not null,
`last_factored` datetime default null,
primary key(`session_id`, `teaching_module_id`, `mode_id`),
constraint `fk_reparts_session`
foreign key (`session_id`)
references `sessions`(`id`) on delete cascade on update cascade,
constraint `fk_reparts_teachingmodule`
foreign key (`teaching_module_id`)
references `teaching_modules`(`id`) on delete cascade on update cascade,
constraint `fk_reparts_mode`
foreign key (`mode_id`)
references `speakmodes`(`id`) on delete restrict on update cascade
);

create table `speaks` (
`session_id` int unsigned not null,
`teaching_module_id` int unsigned not null,
`mode_id` int unsigned not null,
`speaker_id` int unsigned not null,
`hours` double not null default 0,
`internal` boolean not null default 1,
`manager` text not null,
`last_modified` datetime not null,
`last_factored` datetime default null,
primary key(`session_id`, `teaching_module_id`, `mode_id`, `speaker_id`),
constraint `fk_speaks_session`
foreign key (`session_id`)
references `sessions`(`id`) on delete cascade on update cascade,
constraint `fk_speaks_teachingmodule`
foreign key (`teaching_module_id`)
references `teaching_modules`(`id`) on delete cascade on update cascade,
constraint `fk_speaks_speaker`
foreign key (`speaker_id`)
references `users`(`id`) on delete cascade on update cascade,
constraint `fk_speaks_mode`
foreign key (`mode_id`)
references `speakmodes`(`id`) on delete restrict on update cascade
);

create view `v_reparts_fillings`
as select r.`session_id`,
r.`teaching_module_id`,
coalesce((r.`nb` * (r.`timeby` / 60) * r.`groups` * sr.`eqtd`), 0) as mxHours,
coalesce((s.`hours` * ss.`eqtd`), 0) as nbHours
from `reparts` r 
left join `speaks` s on s.`session_id`=r.`session_id` and s.`teaching_module_id`=r.`teaching_module_id`
left join `speakmodes` sr on sr.`id`=r.`mode_id`
left join `speakmodes` ss on ss.`id`=s.`mode_id`;

-- @TODO : créer procédure recopie intervenants Y+1 = Y

-- @TODO ne pas bloquer la saisie sur les speaks selon la repart, mais afficher les eqtd pour ça


