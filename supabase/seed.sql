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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt", "firstName", "lastName", "phoneNumber", "organizationName") VALUES
	('0e413bb2-808a-4267-b587-60b05d1b2b99', 'carlos alcaraz', 'carlos@test.com', true, NULL, '2025-07-03 00:50:00.81', '2025-07-02 23:51:47.099623', 'carlos', 'alcaraz', '+353833197012', 'atp'),
	('26c90fc7-2719-4fe0-9346-65660b0752d0', 'ruzzel widjaja', 'ruzzelwidjaja@gmail.com', true, NULL, '2025-07-03 00:51:34.119', '2025-07-02 23:51:48.684911', 'ruzzel', 'widjaja', '+353833197017', 'bounce'),
	('38168df2-7ee8-4485-b5f3-e8d8b0376681', 'rafael nadal', 'rafa@test.com', true, NULL, '2025-07-03 00:49:14.318', '2025-07-02 23:51:50.105083', 'rafael', 'nadal', '+353833170172', 'atp'),
	('93161416-ce8a-4449-816e-a10e7eee04c1', 'jannik sinner', 'sinner@test.com', true, NULL, '2025-07-03 00:50:35.734', '2025-07-02 23:51:51.432912', 'jannik', 'sinner', '+353833190717', 'atp'),
	('adb175b3-605b-460e-afac-b21580285620', 'novak djokovic', 'novak@test.com', true, NULL, '2025-07-03 00:51:03.599', '2025-07-02 23:51:52.541034', 'novak', 'djokovic', '+353833197102', 'novak'),
	('ec99527f-d9aa-480d-a2a1-3bdb9446b728', 'Roger Federer', 'roger@test.com', true, NULL, '2025-07-03 00:48:22.189', '2025-07-02 23:51:53.63837', 'Roger', 'Federer', '+353833179170', 'atp'),
	('bbe727d0-c4a9-4cb6-9cca-ea48790fe10d', 'andy murray', 'andy@test.com', true, NULL, '2025-07-03 00:52:41.472', '2025-07-02 23:53:28.924956', 'andy', 'murray', '+353833197020', 'atp'),
	('8744c4d7-9daf-47a8-aa3f-862b0d291f89', 'casper ruud', 'casper@test.com', true, NULL, '2025-07-03 00:53:22.531', '2025-07-02 23:53:32.512535', 'casper', 'ruud', '+353833192710', 'atp');


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."account" ("id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt") VALUES
	('d2523715-9474-4588-a93e-a7175679049a', 'ec99527f-d9aa-480d-a2a1-3bdb9446b728', 'credential', 'ec99527f-d9aa-480d-a2a1-3bdb9446b728', NULL, NULL, NULL, NULL, NULL, NULL, '1cbf966ec3e8e2ade0b0013bb357ada1:b981f2a92ea6629cc69745a38f3bb352dc4d70497e7989775aa482532a8845fdcbfc9b09eecfe53da08c2a9b1f3a564dac9944ec3d1ae69c476d47414282105e', '2025-07-03 00:48:22.194', '2025-07-03 00:48:22.194'),
	('3c0de3fe-4fec-46e8-9d76-4c3cb1be6343', '38168df2-7ee8-4485-b5f3-e8d8b0376681', 'credential', '38168df2-7ee8-4485-b5f3-e8d8b0376681', NULL, NULL, NULL, NULL, NULL, NULL, 'f178e8b5fa0aff7641cb5e245839c517:70a9ae934eaa40c3fa1220218b9e5e28d405d759b5a4c6efbc1e731ec5c5106c365104917dc83cc28e57d0e3098020312770cdcb00744425e031742c53cdf11a', '2025-07-03 00:49:14.323', '2025-07-03 00:49:14.323'),
	('e432c963-eab2-4bc4-b7a7-ca16371526be', '0e413bb2-808a-4267-b587-60b05d1b2b99', 'credential', '0e413bb2-808a-4267-b587-60b05d1b2b99', NULL, NULL, NULL, NULL, NULL, NULL, '8c67e06c4c71f86a1b122ed93efc6536:77eb1716529e513040619da19195439a1342e8a72b1d93c6161f4848b26b9e871d4a5bb5944ea57e7458bb9d9a4f3ff33856002b2f49fb36644e65073ea48ae1', '2025-07-03 00:50:00.815', '2025-07-03 00:50:00.815'),
	('ef4ba0b4-0f45-4ccc-8bb5-3f80eb169e51', '93161416-ce8a-4449-816e-a10e7eee04c1', 'credential', '93161416-ce8a-4449-816e-a10e7eee04c1', NULL, NULL, NULL, NULL, NULL, NULL, '7a985ec9aa7b92a825fe8aa939eef30c:159bbe7bce4a6adff6410e40c787f7c8c796b77eb9af03261b1f40228e4627b9ae8fb4ac4a5bd0c8ceed5da6ae2f82a6c790ad6730cd1199a8695bd72caf9200', '2025-07-03 00:50:35.741', '2025-07-03 00:50:35.741'),
	('dce5a976-38a2-4fcf-9719-86c6ba9f4a06', 'adb175b3-605b-460e-afac-b21580285620', 'credential', 'adb175b3-605b-460e-afac-b21580285620', NULL, NULL, NULL, NULL, NULL, NULL, '73a0190c5abc92998e092ad445fb62cd:d80ca263c71ce2628010f2e8f332616bdf99bc465d76e05e7f4a8b6976b631e474897b9a330b55e0d23739c41e85cd3bf411f9d530cddc6f186bfe74b5731642', '2025-07-03 00:51:03.602', '2025-07-03 00:51:03.602'),
	('e79d4c10-eda1-48d9-b67f-19ee6a648ed7', '26c90fc7-2719-4fe0-9346-65660b0752d0', 'credential', '26c90fc7-2719-4fe0-9346-65660b0752d0', NULL, NULL, NULL, NULL, NULL, NULL, '58df7a9a3eef1058258d823b0abedb25:35f1abdcf43375a5fbccbbf305b8c074921ef2e9dc2833f86f45366b2844ef5dc289659105538a79ccab3adf4e0ecf989b67c432613dfd0ef343fb9c351b3ab4', '2025-07-03 00:51:34.121', '2025-07-03 00:51:34.121'),
	('e8e4f265-7372-4808-90ed-e735e453a2a0', 'bbe727d0-c4a9-4cb6-9cca-ea48790fe10d', 'credential', 'bbe727d0-c4a9-4cb6-9cca-ea48790fe10d', NULL, NULL, NULL, NULL, NULL, NULL, '7195f0cdd6dfca3e0712cc020ec4076c:6dbec0f8588108aba84f6f62c8c0fa22487df8a2957af3f0e648a0dd8b7fa8dc945be22e594a26517e5bf9cd6c32857e1da2c1156cddbf78ca31369114b61116', '2025-07-03 00:52:41.476', '2025-07-03 00:52:41.476'),
	('d4a38834-64aa-4b54-ab72-208f1b9e5cc1', '8744c4d7-9daf-47a8-aa3f-862b0d291f89', 'credential', '8744c4d7-9daf-47a8-aa3f-862b0d291f89', NULL, NULL, NULL, NULL, NULL, NULL, '5a16975ed3c3cc9075a063a2d3cab3d1:7514680fcb7e214389b6f81128008327d6776ca2d70699e9f9243553ebdaddfe3173883f9e64c112b2e4468a8c2a83f065af2cdfb90975b76f0cbd0e5eaaf9ce', '2025-07-03 00:53:22.534', '2025-07-03 00:53:22.534');


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."leagues" ("id", "name", "description", "joinCode", "seasonStart", "seasonEnd", "createdBy", "createdAt", "fairRejectionThreshold") VALUES
	('d3094789-261f-45c3-9d6a-aa12fe13acb3', 'Test Ping Pong League', 'A test league for development', 'test123', '2025-05-28', '2025-11-28', NULL, '2025-05-28 21:53:42.833128+00', 6);


--
-- Data for Name: challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activity_logs" ("id", "leagueId", "userId", "relatedUserId", "action", "metadata", "createdAt", "challengeId") VALUES
	('a91cd962-e78b-4fd2-8928-335e2ec57952', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '0e413bb2-808a-4267-b587-60b05d1b2b99', NULL, 'joinedLeague', '{"rank": 1, "skillTier": "top"}', '2025-07-02 23:54:14.555+00', NULL),
	('b3b517ff-59ad-4ba8-8408-13f87fa39227', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', 'ec99527f-d9aa-480d-a2a1-3bdb9446b728', NULL, 'joinedLeague', '{"rank": 2, "skillTier": "top"}', '2025-07-02 23:54:39.674+00', NULL),
	('6ebadebf-977a-44dd-a711-93b01aaeef36', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '93161416-ce8a-4449-816e-a10e7eee04c1', NULL, 'joinedLeague', '{"rank": 3, "skillTier": "top"}', '2025-07-02 23:55:03.992+00', NULL),
	('39df40ad-a2bf-446b-a4d9-362386a5d51e', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '26c90fc7-2719-4fe0-9346-65660b0752d0', NULL, 'joinedLeague', '{"rank": 4, "skillTier": "middle"}', '2025-07-02 23:55:39.558+00', NULL),
	('7b4ebac8-b780-433d-b860-52bfa1ba7c9c', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', 'adb175b3-605b-460e-afac-b21580285620', NULL, 'joinedLeague', '{"rank": 5, "skillTier": "bottom"}', '2025-07-02 23:56:01.492+00', NULL),
	('e5bb8deb-7398-4178-833f-8ce46c6e5299', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '8744c4d7-9daf-47a8-aa3f-862b0d291f89', NULL, 'joinedLeague', '{"rank": 6, "skillTier": "bottom"}', '2025-07-02 23:56:18.97+00', NULL),
	('e9b859eb-5a05-442d-a076-aa775ad280a7', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '38168df2-7ee8-4485-b5f3-e8d8b0376681', NULL, 'joinedLeague', '{"rank": 7, "skillTier": "middle"}', '2025-07-02 23:56:50.539+00', NULL),
	('d3c2cf65-5127-4313-8555-70feeb619d84', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', 'bbe727d0-c4a9-4cb6-9cca-ea48790fe10d', NULL, 'joinedLeague', '{"rank": 8, "skillTier": "middle"}', '2025-07-02 23:57:11.31+00', NULL);


--
-- Data for Name: league_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."league_members" ("id", "leagueId", "userId", "rank", "skillTier", "status", "joinedAt", "recentRejections", "recentAcceptances", "activityWindowStart", "previousRank", "availability", "ootDaysUsed") VALUES
	('7d52310e-2dd4-40d8-b1df-211b0961072c', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '0e413bb2-808a-4267-b587-60b05d1b2b99', 1, 'top', 'active', '2025-07-02 23:54:14.555+00', 0, 0, NULL, NULL, '{"friday": {"after_work": true}, "tuesday": {"lunch": true, "after_work": true}, "wednesday": {"lunch": true, "after_work": true}}', 0),
	('f728091c-b5dc-4e28-9ef5-03a9c4f64f98', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', 'ec99527f-d9aa-480d-a2a1-3bdb9446b728', 2, 'top', 'active', '2025-07-02 23:54:39.674+00', 0, 0, NULL, NULL, '{"friday": {"after_work": true}, "monday": {"after_work": true}, "tuesday": {"lunch": true}, "thursday": {"lunch": true}, "wednesday": {"after_work": true}}', 0),
	('7f991e64-82f3-469e-9a74-5d6bf61399a8', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '93161416-ce8a-4449-816e-a10e7eee04c1', 3, 'top', 'active', '2025-07-02 23:55:03.992+00', 0, 0, NULL, NULL, '{"friday": {"lunch": true}, "monday": {"lunch": true}}', 0),
	('fc0c39d3-2a6f-4a51-b745-3366dcf05869', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '26c90fc7-2719-4fe0-9346-65660b0752d0', 4, 'middle', 'active', '2025-07-02 23:55:39.557+00', 0, 0, NULL, NULL, '{"tuesday": {"lunch": true, "after_work": true}, "thursday": {"lunch": true, "after_work": true}, "wednesday": {"lunch": true, "after_work": true}}', 0),
	('54600417-ee7a-46f1-972f-48e54089240d', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', 'adb175b3-605b-460e-afac-b21580285620', 5, 'bottom', 'active', '2025-07-02 23:56:01.492+00', 0, 0, NULL, NULL, '{"monday": {"lunch": true}, "thursday": {"after_work": true}, "wednesday": {"lunch": true, "after_work": true}}', 0),
	('95b55441-cf2a-44fb-a6cf-973f9a9a2342', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '8744c4d7-9daf-47a8-aa3f-862b0d291f89', 6, 'bottom', 'active', '2025-07-02 23:56:18.968+00', 0, 0, NULL, NULL, '{"monday": {"after_work": true}, "tuesday": {"lunch": true}, "thursday": {"after_work": true}, "wednesday": {"lunch": true, "after_work": true}}', 0),
	('435405e2-49a5-4429-8e41-85996757c249', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', '38168df2-7ee8-4485-b5f3-e8d8b0376681', 7, 'middle', 'active', '2025-07-02 23:56:50.538+00', 0, 0, NULL, NULL, '{"monday": {"lunch": true}, "tuesday": {"lunch": true, "after_work": true}, "wednesday": {"after_work": true}}', 0),
	('bed1d593-2923-4593-a9c4-4d3ea4fa8147', 'd3094789-261f-45c3-9d6a-aa12fe13acb3', 'bbe727d0-c4a9-4cb6-9cca-ea48790fe10d', 8, 'middle', 'active', '2025-07-02 23:57:11.31+00', 0, 0, NULL, NULL, '{"friday": {"lunch": true, "after_work": true}, "monday": {"lunch": true, "after_work": true}}', 0);


--
-- Data for Name: out_of_town_periods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."session" ("id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") VALUES
	('b80f50b1-4595-476a-945d-102c7c0c165e', '2025-08-02 00:57:39.313', 'ti1M8Jl0lIHXQndKuyLGHoqaV4fhNthr', '2025-07-03 00:57:39.314', '2025-07-03 00:57:39.314', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '26c90fc7-2719-4fe0-9346-65660b0752d0');


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('profile-pictures', 'profile-pictures', NULL, '2025-07-02 23:46:50.757364+00', '2025-07-02 23:46:50.757364+00', true, false, 5242880, '{image/jpeg,image/png,image/webp,image/gif,image/jpg}', NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
