--
-- PostgreSQL database dump
--

\restrict 7hisoJkCWBKTHhhy3GYtngsJIgE1hL4gOwKeRRauJTy7I3qfmJdSSDRA6ZCoLJw

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    recipe_id integer,
    name character varying(255) NOT NULL,
    quantity numeric(10,3),
    unit character varying(50)
);


--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: production_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_plans (
    id integer NOT NULL,
    plan_date date NOT NULL,
    recipe_id integer,
    quantity_to_produce integer,
    status character varying(50) DEFAULT 'planned'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: production_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.production_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.production_plans_id_seq OWNED BY public.production_plans.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100),
    yield_quantity integer,
    yield_unit character varying(50),
    prep_time_minutes integer,
    bake_time_minutes integer,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    user_id integer,
    shift_date date NOT NULL,
    shift_type character varying(20) NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    unit character varying(50),
    quantity numeric(10,3) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_id_seq OWNED BY public.stock.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    recipe_id integer,
    assigned_to integer,
    created_by integer,
    quantity integer,
    due_date date DEFAULT CURRENT_DATE,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(50) DEFAULT 'normal'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'staff'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: production_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_plans ALTER COLUMN id SET DEFAULT nextval('public.production_plans_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock ALTER COLUMN id SET DEFAULT nextval('public.stock_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredients (id, recipe_id, name, quantity, unit) FROM stdin;
1	1	Flour	500.000	g
2	1	Butter	300.000	g
3	1	Milk	200.000	ml
4	1	Yeast	10.000	g
5	6	Oeufs	32.000	p
6	6	Sucre semoule	2.000	kg
7	6	Beurre	2.000	kg
8	6	Farine	1.700	kg
9	6	Poudre cacao	0.200	kg
10	6	Levure chimique	6.000	sachets
11	7	Oeufs	32.000	p
12	7	Sucre semoule	2.000	kg
13	7	Beurre	2.000	kg
14	7	Farine	1.800	kg
15	7	Levure chimique	6.000	sachets
16	13	Oeufs	60.000	p
17	13	Sucre semoule	1.600	kg
18	13	Farine	1.000	kg
19	13	Poudre d'amande	1.000	kg
20	13	Levure chimique	2.000	sachets
21	2	Oeufs	20.000	p
22	2	Sucre semoule	1.000	kg
23	2	Huile	0.600	L
24	2	Farine	1.200	kg
25	2	Levure chimique	6.000	sachets
26	9	Lait frais	1.000	L
27	9	Sucre semoule	0.150	kg
28	9	Oeufs	4.000	p
29	9	Poudre pâtissière	0.150	kg
30	9	Arôme vanille	1.000	p
31	42	Crème fraîche	0.400	kg
32	42	Chocolat 5/5 noir	0.300	kg
33	42	Oeufs	3.000	p
34	69	Chocolat riche	0.475	kg
35	69	Beurre	0.450	kg
36	69	Oeufs	15.000	p
37	69	Sucre semoule	0.500	kg
38	69	Farine	0.200	kg
43	23	Jus d'orange	0.150	L
44	23	Beurre	0.150	kg
45	23	Sucre semoule	0.300	kg
46	23	Farine	0.090	kg
47	17	Farine	0.250	kg
48	17	Beurre	0.125	kg
49	17	Oeufs	1.000	p
50	18	Farine	1.000	kg
51	18	Lait en poudre	0.030	kg
52	18	Levure fraîche	0.030	kg
53	18	Oeufs	1.000	p
54	22	creme fraiche	1.000	L
55	22	jeune ouefs	10.000	p
56	22	sucre	100.000	KG
\.


--
-- Data for Name: production_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.production_plans (id, plan_date, recipe_id, quantity_to_produce, status, created_at) FROM stdin;
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipes (id, name, category, yield_quantity, yield_unit, prep_time_minutes, bake_time_minutes, notes, created_at) FROM stdin;
1	Croissant	Viennoiserie	24	pieces	60	20		2026-05-22 15:48:58.589431
3	Croustillant feuillantine chocolat	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
4	Opéra	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
5	Sablé breton	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
8	Crème au citron	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
10	Pâte à choux	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
11	Pâte sucrée	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
12	Crème d'amande	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
14	Financier	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
15	Ganache Riche	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
16	Pâte Feuilletée	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
19	Crème anglaise	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
20	Charlotte aux fraises	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
21	Compote de fruits	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
22	Appareil à crème brûlée	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
23	Tuiles dentelles	Pâtisseries Classiques	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
24	Pâtisserie marocaine	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
25	Tartelette amande	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
26	Tartelette chocolat	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
27	Tartelette aux fruits	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
28	Macarons	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
29	Brownies	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
30	Paris-Brest	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
31	Mille-feuille	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
32	Choux à la crème	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
33	Tarte Tatin	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
34	Éclair au chocolat	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
35	Meringue française	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
36	Les Palmiers	Pâtisseries Gourmandes	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
37	Galette des rois	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
38	Les jalousie	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
39	Les bandes feuillette	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
40	Tarte aux pommes	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
41	Tarte à l'amande	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
42	Tarte aux Chocolat	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
43	Tarte noix d'coco	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
44	Tarte soufflé yaourt	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
45	Tarte à la Poire	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
46	Biscuit roulé	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
47	Crème caramel	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
48	Flan (Vanille, chocolat, fraise)	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
49	Clafoutis aux cerises	Pâtisseries de Saison	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
50	Quiche Lorraine	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
51	Feuilleté au fromage	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
52	Briouat	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
53	Les Nemes	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
54	Pain d'épices	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
55	Tarte aux légumes	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
56	Mini pizzas	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
57	Cake aux olives	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
58	Tarte à l'oignon	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
59	Tourte aux épinards et fromage de chèvre	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
60	Chaussons au fromage	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
61	Gougères	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
62	Cannelés salés	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
63	Empanadas	Pâtisseries Salées	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
64	Panna cotta	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
65	Mousse au Chocolat	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
66	Tarte Passion	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
67	Tarte Citron	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
70	Crumble aux Pommes	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
71	Tiramisu	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
72	Crêpes Suzette	Desserts Frais	\N	\N	\N	\N	\N	2026-05-23 11:51:36.405862
6	Madeleines noires	Pâtisseries Classiques	\N	\N	\N	13	\N	2026-05-23 11:51:36.405862
7	Madeleines blanches	Pâtisseries Classiques	\N	\N	\N	13	\N	2026-05-23 11:51:36.405862
13	Biscuit	Pâtisseries Classiques	\N	\N	\N	8	\N	2026-05-23 11:51:36.405862
2	Gâteau (chocolat, vanille, cafe)	Pâtisseries Classiques	\N	\N	\N	40	\N	2026-05-23 11:51:36.405862
9	Crème pâtissière	Pâtisseries Classiques	\N	\N	\N	25	\N	2026-05-23 11:51:36.405862
69	Fondant au chocolat	Desserts Frais	\N	\N	\N	9	\N	2026-05-23 11:51:36.405862
17	Pâte Brisée	Pâtisseries Classiques	\N	\N	\N	25	\N	2026-05-23 11:51:36.405862
18	Pâte a Pizza	Pâtisseries Classiques	\N	\N	\N	4	\N	2026-05-23 11:51:36.405862
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shifts (id, user_id, shift_date, shift_type, created_by, created_at) FROM stdin;
2	3	2026-05-19	nuit	1	2026-05-23 13:02:01.958993
9	3	2026-05-22	aprem	1	2026-05-23 13:08:55.206042
3	1	2026-05-19	aprem	1	2026-05-23 13:02:12.455184
10	3	2026-05-20	aprem	1	2026-05-23 13:09:11.653802
11	4	2026-05-20	nuit	1	2026-05-23 13:09:18.82337
12	1	2026-05-23	aprem	1	2026-05-23 13:09:31.698155
14	4	2026-05-22	nuit	1	2026-05-23 18:12:21.314121
16	2	2026-05-21	aprem	1	2026-05-23 18:12:59.197892
17	4	2026-05-21	nuit	1	2026-05-23 18:13:12.343761
19	1	2026-05-24	aprem	1	2026-05-23 20:31:24.669288
20	4	2026-05-18	aprem	1	2026-05-23 23:01:30.85847
1	4	2026-05-18	matin	1	2026-05-23 13:01:48.017975
4	4	2026-05-18	matin	1	2026-05-23 13:03:20.868871
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock (id, name, unit, quantity, created_at) FROM stdin;
1	Farine	kg	0.000	2026-05-23 11:54:10.289365
2	Sucre Semoule	kg	0.000	2026-05-23 11:54:10.289365
3	Beurre	kg	0.000	2026-05-23 11:54:10.289365
4	Oeufs	pièce	0.000	2026-05-23 11:54:10.289365
5	Crème fraîche	L	0.000	2026-05-23 11:54:10.289365
7	Sucre vanille	pièce	0.000	2026-05-23 11:54:10.289365
8	Nappage	pièce	0.000	2026-05-23 11:54:10.289365
9	Levure fraîche	pièce	0.000	2026-05-23 11:54:10.289365
10	Sucre Glace	kg	0.000	2026-05-23 11:54:10.289365
11	Arôme vanille	pièce	0.000	2026-05-23 11:54:10.289365
12	Arôme framboise	pièce	0.000	2026-05-23 11:54:10.289365
13	Chocolat riche	kg	0.000	2026-05-23 11:54:10.289365
14	Chocolat riche lait	kg	0.000	2026-05-23 11:54:10.289365
15	Chocolat 5/5 noir	kg	0.000	2026-05-23 11:54:10.289365
16	Chocolat 5/5 blanc	kg	0.000	2026-05-23 11:54:10.289365
17	Chocolat batonnet	kg	0.000	2026-05-23 11:54:10.289365
18	Gélatine	pièce	0.000	2026-05-23 11:54:10.289365
20	Poudre pâtissière	kg	0.000	2026-05-23 11:54:10.289365
21	Poudre d'amande	kg	0.000	2026-05-23 11:54:10.289365
22	Poudre cacao	kg	0.000	2026-05-23 11:54:10.289365
23	Amandes effilées	kg	0.000	2026-05-23 11:54:10.289365
24	Amandes hachées	kg	0.000	2026-05-23 11:54:10.289365
25	Margarine	kg	0.000	2026-05-23 11:54:10.289365
26	Améliorant pain	kg	0.000	2026-05-23 11:54:10.289365
27	Améliorant cake	kg	0.000	2026-05-23 11:54:10.289365
28	Praliné	kg	0.000	2026-05-23 11:54:10.289365
29	Pailleté feuilletine	kg	0.000	2026-05-23 11:54:10.289365
30	Poire au sirop	pièce	0.000	2026-05-23 11:54:10.289365
31	Ananas au sirop	pièce	0.000	2026-05-23 11:54:10.289365
32	Pêche au sirop	pièce	0.000	2026-05-23 11:54:10.289365
33	Cacahuète	kg	0.000	2026-05-23 11:54:10.289365
34	Noix de coco	kg	0.000	2026-05-23 11:54:10.289365
35	Eau de fleur	kg	0.000	2026-05-23 11:54:10.289365
36	Lait frais	L	0.000	2026-05-23 11:54:10.289365
37	Lait en poudre	kg	0.000	2026-05-23 11:54:10.289365
38	Huile 5L	L	0.000	2026-05-23 11:54:10.289365
39	Noix décortiquées	kg	0.000	2026-05-23 11:54:10.289365
40	Amandes entières	kg	0.000	2026-05-23 11:54:10.289365
41	Glucose	kg	0.000	2026-05-23 11:54:10.289365
42	Miel	pièce	0.000	2026-05-23 11:54:10.289365
43	Couleur alimentaire	pièce	0.000	2026-05-23 11:54:10.289365
19	Maïzena	kg	1.000	2026-05-23 11:54:10.289365
6	Levure chimique	pièce	100.000	2026-05-23 11:54:10.289365
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, description, recipe_id, assigned_to, created_by, quantity, due_date, status, priority, created_at) FROM stdin;
3	Prepare Croissant dough		1	2	1	24	2026-05-22	pending	high	2026-05-22 17:17:25.121324
4	Prepare Croissant dough	test	1	2	1	24	2026-05-22	pending	high	2026-05-22 17:18:04.320942
9	Test Task	\N	\N	2	1	\N	2026-05-23	pending	normal	2026-05-23 10:59:34.225954
10	test	test	1	2	1	22	2026-05-23	pending	normal	2026-05-23 11:00:59.290671
5	Prepare Croissant dough		1	2	1	8	2026-05-22	done	high	2026-05-22 17:19:07.016125
2	Prepare Croissant dough		1	2	1	24	2026-05-22	done	high	2026-05-22 17:15:26.41662
1	Prepare Croissant dough		1	2	1	24	2026-05-22	done	high	2026-05-22 17:13:45.272077
12	123	123	15	2	1	1	2026-05-23	done	low	2026-05-23 12:52:46.457134
13	test	test	72	3	1	1	2026-05-23	done	high	2026-05-23 18:11:07.852428
14	net	test	71	3	1	11	2026-05-23	pending	high	2026-05-23 20:39:35.418843
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, username, password_hash, role, created_at) FROM stdin;
1	Head Chef	headchef	$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	head_chef	2026-05-22 16:25:42.254319
2	Ismail	ismail	$2b$10$dr5G4Yr5d7Igw0R2g7FtCuU/xuyftlYlq3yPAwD0IkfBo4jKnShcK	staff	2026-05-22 17:10:03.0414
3	stagair	st	$2b$10$VLUNlpsF40EM4AcuK8E7D.4Edwv.6quxcw7Wc28B0rOe./Fm6YTxS	staff	2026-05-23 12:55:11.129779
4	test	test	$2b$10$5Kz76ZkNqMju1vHdvhXCUOUOxLQBbGBK8zXGlJKo4mL6pwgK/ZaT.	staff	2026-05-23 13:03:03.688591
5	Latifa	lati@gmail.com	$2b$10$.PdTpA44M4AG1c4qta//PexmeuCEAIajk2KpLgkEJMt/EWSypohdK	staff	2026-05-23 23:06:18.438911
\.


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 56, true);


--
-- Name: production_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.production_plans_id_seq', 1, false);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipes_id_seq', 72, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shifts_id_seq', 20, true);


--
-- Name: stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_id_seq', 43, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 14, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: production_plans production_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_plans
    ADD CONSTRAINT production_plans_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ingredients ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: production_plans production_plans_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_plans
    ADD CONSTRAINT production_plans_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id);


--
-- Name: shifts shifts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: shifts shifts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 7hisoJkCWBKTHhhy3GYtngsJIgE1hL4gOwKeRRauJTy7I3qfmJdSSDRA6ZCoLJw

