-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Admins (
  admin_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fullname text NOT NULL,
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'Superadmin'::text CHECK (role = ANY (ARRAY['Superadmin'::text, 'Processor'::text])),
  status text DEFAULT 'Active'::text CHECK (status = ANY (ARRAY['Active'::text, 'Inactive'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login_at timestamp without time zone,
  CONSTRAINT Admins_pkey PRIMARY KEY (admin_id)
);
CREATE TABLE public.Assigned Roles (
  assignment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint NOT NULL,
  admin_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Assigned Roles_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT Assigned Roles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Assigned Roles_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Document Categories (
  category_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Document Categories_pkey PRIMARY KEY (category_id)
);
CREATE TABLE public.Document Forms (
  form_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint NOT NULL,
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type = ANY (ARRAY['TEXT'::text, 'TEXTAREA'::text, 'NUMBER'::text, 'FILE'::text, 'DATE'::text, 'EMAIL'::text, 'SELECT'::text, 'RADIO'::text, 'CHECKBOX'::text])),
  is_required boolean DEFAULT false,
  field_order smallint DEFAULT 0,
  placeholder text,
  default_value text,
  group_id bigint,
  validation_rule text,
  field_width smallint DEFAULT 12 CHECK (field_width = ANY (ARRAY[3, 4, 6, 12])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Document Forms_pkey PRIMARY KEY (form_id),
  CONSTRAINT Document Forms_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Document Forms_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.Form Field Groups(group_id)
);
CREATE TABLE public.Documents (
  document_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint NOT NULL,
  document_name text NOT NULL,
  document_path text NOT NULL,
  description text,
  created_by bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Documents_pkey PRIMARY KEY (document_id),
  CONSTRAINT Documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Form Field Groups (
  group_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint NOT NULL,
  group_name text NOT NULL,
  group_order smallint DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Form Field Groups_pkey PRIMARY KEY (group_id),
  CONSTRAINT Form Field Groups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id)
);
CREATE TABLE public.Form Field Options (
  option_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  form_id bigint NOT NULL,
  option_value text NOT NULL,
  option_order smallint DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Form Field Options_pkey PRIMARY KEY (option_id),
  CONSTRAINT Form Field Options_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.Document Forms(form_id)
);
CREATE TABLE public.Login Audits (
  audit_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  admin_id bigint,
  status text CHECK (status = ANY (ARRAY['Success'::text, 'Failed'::text])),
  login_datetime timestamp with time zone DEFAULT now(),
  CONSTRAINT Login Audits_pkey PRIMARY KEY (audit_id),
  CONSTRAINT Login Audits_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Notifications (
  notification_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  type character varying,
  subject character varying,
  message text,
  request_id integer,
  payment_id integer,
  admin_id integer,
  owner_id integer,
  retry_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT Notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT Notifications_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Notifications_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.Payments(payment_id),
  CONSTRAINT Notifications_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.Admins(admin_id),
  CONSTRAINT Notifications_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.Owners(owner_id)
);
CREATE TABLE public.Owners (
  owner_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fullname text NOT NULL,
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  phone_number character varying,
  business_name text,
  business_address text,
  status character varying DEFAULT 'Active'::character varying CHECK (status::text = ANY (ARRAY['Active'::character varying, 'Inactive'::character varying, 'Suspended'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Owners_pkey PRIMARY KEY (owner_id)
);
CREATE TABLE public.Payment History (
  history_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  payment_id bigint NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  changed_by bigint NOT NULL,
  remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Payment History_pkey PRIMARY KEY (history_id),
  CONSTRAINT Payment History_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.Payments(payment_id),
  CONSTRAINT Payment History_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Payments (
  payment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint NOT NULL,
  reference_number character varying,
  amount double precision NOT NULL,
  status text DEFAULT 'Pending'::text CHECK (status = ANY (ARRAY['Pending'::text, 'Verified'::text, 'Rejected'::text])),
  payment_type text NOT NULL,
  description text,
  payment_method text CHECK (payment_method = ANY (ARRAY['Cash'::text, 'Check'::text, 'Money Order'::text])),
  payment_date timestamp with time zone,
  processed_by bigint,
  remarks text,
  receipt_number text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT Payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT Payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Payments_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Request Attachments (
  attachment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  remarks text,
  uploaded_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Request Attachments_pkey PRIMARY KEY (attachment_id),
  CONSTRAINT Request Attachments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Request Attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Request Form Data (
  data_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint NOT NULL,
  form_id bigint NOT NULL,
  field_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Request Form Data_pkey PRIMARY KEY (data_id),
  CONSTRAINT Request Form Data_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Request Form Data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.Document Forms(form_id)
);
CREATE TABLE public.Request History (
  history_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  changed_by bigint NOT NULL,
  remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Request History_pkey PRIMARY KEY (history_id),
  CONSTRAINT Request History_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Request History_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Requests (
  request_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  owner_id bigint NOT NULL,
  category_id bigint NOT NULL,
  tracking_code text NOT NULL UNIQUE,
  status text DEFAULT 'Pending'::text CHECK (status = ANY (ARRAY['Pending'::text, 'Under Review'::text, 'Approved'::text, 'Rejected'::text, 'Cancelled'::text, 'Completed'::text])),
  date_requested timestamp with time zone DEFAULT now(),
  date_release date,
  processed_by bigint,
  remarks text,
  payment_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT Requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.Owners(owner_id),
  CONSTRAINT Requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.Admins(admin_id)
);