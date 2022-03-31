create table historico_multiplicaciones (
	id bigserial primary key,
	resultado text not null,
	registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
	activo boolean default true not null
)

commit