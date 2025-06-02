SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."leagues" ("id", "name", "description", "join_code", "season_start", "season_end", "created_by", "created_at") VALUES
	('d3094789-261f-45c3-9d6a-aa12fe13acb3', 'Test Ping Pong League', 'A test league for development', 'test123', '2025-05-28', '2025-11-28', NULL, '2025-05-28 21:53:42.833128+00');


--
-- Data for Name: challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: league_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

RESET ALL;
