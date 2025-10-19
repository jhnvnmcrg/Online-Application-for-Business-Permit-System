-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Activity_Logs (
  log_id integer NOT NULL DEFAULT nextval('"Activity_Logs_log_id_seq"'::regclass),
  request_id integer,
  payment_id integer,
  action character varying,
  performed_by integer,
  ip_address character varying,
  details jsonb,
  created_at timestamp without time zone DEFAULT now(),
  user_type character varying,
  user_id integer,
  CONSTRAINT Activity_Logs_pkey PRIMARY KEY (log_id),
  CONSTRAINT Activity_Logs_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Activity_Logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Admins (
  admin_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fullname text,
  email text UNIQUE,
  username text UNIQUE,
  password text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text,
  role text,
  last_login_at timestamp without time zone,
  CONSTRAINT Admins_pkey PRIMARY KEY (admin_id)
);
CREATE TABLE public.Assigned Roles (
  assignment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint,
  admin_id bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Assigned Roles_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT Assigned Roles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Assigned Roles_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Blacklist (
  blacklist_id integer NOT NULL DEFAULT nextval('"Blacklist_blacklist_id_seq"'::regclass),
  type character varying NOT NULL,
  value character varying NOT NULL,
  reason text,
  added_by integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Blacklist_pkey PRIMARY KEY (blacklist_id),
  CONSTRAINT Blacklist_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Document Categories (
  category_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_name text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Document Categories_pkey PRIMARY KEY (category_id)
);
CREATE TABLE public.Document Deliveries (
  delivery_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint,
  method text,
  delivered_by bigint,
  delivered_at date,
  remarks text,
  CONSTRAINT Document Deliveries_pkey PRIMARY KEY (delivery_id),
  CONSTRAINT Document Deliveries_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Document Deliveries_delivered_by_fkey FOREIGN KEY (delivered_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Document Forms (
  form_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint,
  field_name text,
  field_type text,
  is_required boolean,
  field_order smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  placeholder text,
  default_value text,
  group_id bigint,
  validation_rule text,
  field_width smallint,
  CONSTRAINT Document Forms_pkey PRIMARY KEY (form_id),
  CONSTRAINT Document Forms_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Document Forms_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.Form Field Groups(group_id)
);
CREATE TABLE public.Documents (
  document_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint,
  document_name text,
  description text,
  created_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  document_path text,
  CONSTRAINT Documents_pkey PRIMARY KEY (document_id),
  CONSTRAINT Documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Download_Logs (
  download_id integer NOT NULL DEFAULT nextval('"Download_Logs_download_id_seq"'::regclass),
  request_id integer,
  attachment_id integer,
  downloaded_by integer,
  ip_address character varying,
  user_agent text,
  downloaded_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Download_Logs_pkey PRIMARY KEY (download_id),
  CONSTRAINT Download_Logs_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Download_Logs_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES public.Request Attachments(attachment_id),
  CONSTRAINT Download_Logs_downloaded_by_fkey FOREIGN KEY (downloaded_by) REFERENCES public.Owners(owner_id)
);
CREATE TABLE public.Form Field Groups (
  group_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint,
  group_name text,
  group_order smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Form Field Groups_pkey PRIMARY KEY (group_id),
  CONSTRAINT Form Field Groups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id)
);
CREATE TABLE public.Form Field Options (
  option_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  form_id bigint,
  option_value text,
  option_order smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Form Field Options_pkey PRIMARY KEY (option_id),
  CONSTRAINT Form Field Options_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.Document Forms(form_id)
);
CREATE TABLE public.Login Audits (
  audit_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  admin_id bigint,
  status text,
  login_datetime timestamp with time zone,
  CONSTRAINT Login Audits_pkey PRIMARY KEY (audit_id),
  CONSTRAINT Login Audits_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.Admins(admin_id)
);
CREATE TABLE public.Notification_Templates (
  template_id integer NOT NULL DEFAULT nextval('"Notification_Templates_template_id_seq"'::regclass),
  template_code character varying NOT NULL UNIQUE,
  template_name character varying NOT NULL,
  subject character varying,
  body_email text,
  body_sms text,
  body_push text,
  variables jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Notification_Templates_pkey PRIMARY KEY (template_id)
);
CREATE TABLE public.Notifications (
  notification_id integer NOT NULL DEFAULT nextval('"Notifications_notification_id_seq"'::regclass),
  user_type character varying,
  user_id integer,
  type character varying,
  template character varying,
  subject character varying,
  message text,
  status character varying DEFAULT 'Pending'::character varying,
  sent_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  read_at timestamp without time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  request_id integer,
  payment_id integer,
  admin_id integer,
  owner_id integer,
  CONSTRAINT Notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT Notifications_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.Admins(admin_id),
  CONSTRAINT Notifications_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.Owners(owner_id),
  CONSTRAINT Notifications_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.Payments(payment_id),
  CONSTRAINT Notifications_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id)
);
CREATE TABLE public.Owners (
  owner_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fullname text,
  email text UNIQUE,
  username text UNIQUE,
  password text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  phone_number character varying,
  business_name text,
  business_address text,
  status character varying DEFAULT 'Active'::character varying,
  last_login_at timestamp without time zone,
  CONSTRAINT Owners_pkey PRIMARY KEY (owner_id)
);
CREATE TABLE public.Payment History (
  history_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  payment_id bigint,
  previous_status text,
  new_status text,
  changed_by bigint,
  remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Payment History_pkey PRIMARY KEY (history_id),
  CONSTRAINT Payment History_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.Admins(admin_id),
  CONSTRAINT Payment History_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.Payments(payment_id)
);
CREATE TABLE public.Payments (
  payment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint,
  reference_number character varying,
  amount double precision,
  proof_payment text,
  status text DEFAULT 'Pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  payment_type text,
  description text,
  receiver_name text,
  receiver_number character varying,
  receiver_account text,
  payment_method text,
  sender_number character varying,
  payment_date timestamp with time zone,
  created_by bigint,
  updated_at timestamp with time zone DEFAULT now(),
  verified_by bigint,
  remarks text,
  deadline timestamp with time zone,
  reminded_at timestamp with time zone,
  receipt_number text UNIQUE,
  overdue boolean DEFAULT false,
  reminder_count integer DEFAULT 0,
  last_reminder_at timestamp without time zone,
  verified_at timestamp without time zone,
  rejected_at timestamp without time zone,
  rejected_reason text,
  payment_deadline timestamp with time zone,
  CONSTRAINT Payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT Payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.Admins(admin_id),
  CONSTRAINT Payments_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.Admins(admin_id),
  CONSTRAINT Payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id)
);
CREATE TABLE public.Request Attachments (
  attachment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint,
  file_name text,
  remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  uploaded_by bigint,
  file_path text,
  CONSTRAINT Request Attachments_pkey PRIMARY KEY (attachment_id),
  CONSTRAINT Request Attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.Admins(admin_id),
  CONSTRAINT Request Attachments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id)
);
CREATE TABLE public.Request Form Data (
  data_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  field_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  request_id bigint,
  form_id bigint,
  CONSTRAINT Request Form Data_pkey PRIMARY KEY (data_id),
  CONSTRAINT Request Form Data_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id),
  CONSTRAINT Request Form Data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.Document Forms(form_id)
);
CREATE TABLE public.Request History (
  history_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id bigint,
  previous_status text,
  new_status text,
  changed_by bigint,
  remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Request History_pkey PRIMARY KEY (history_id),
  CONSTRAINT Request History_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.Admins(admin_id),
  CONSTRAINT Request History_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id)
);
CREATE TABLE public.Requests (
  request_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  owner_id bigint,
  category_id bigint,
  tracking_code text,
  date_requested timestamp with time zone DEFAULT now(),
  date_release date,
  status text DEFAULT 'Pending'::text,
  processed_by bigint,
  remarks text,
  priority text DEFAULT 'Normal'::text,
  sla_deadline timestamp with time zone,
  assigned_at timestamp with time zone,
  completed_at timestamp without time zone,
  cancelled_at timestamp without time zone,
  cancelled_by integer,
  rejection_reason text,
  payment_required boolean DEFAULT false,
  payment_verified_at timestamp without time zone,
  document_downloaded_at timestamp without time zone,
  source character varying DEFAULT 'Web'::character varying,
  updated_at timestamp without time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT Requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT Requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.Owners(owner_id),
  CONSTRAINT Requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Document Categories(category_id),
  CONSTRAINT Requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.Admins(admin_id),
  CONSTRAINT Requests_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.Owners(owner_id)
);
CREATE TABLE public.SLA_Breaches (
  breach_id integer NOT NULL DEFAULT nextval('"SLA_Breaches_breach_id_seq"'::regclass),
  request_id integer,
  stage character varying,
  target_days integer,
  actual_days integer,
  breach_days integer,
  detected_at timestamp without time zone DEFAULT now(),
  resolved_at timestamp without time zone,
  remarks text,
  CONSTRAINT SLA_Breaches_pkey PRIMARY KEY (breach_id),
  CONSTRAINT SLA_Breaches_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.Requests(request_id)
);
CREATE TABLE public.System_Settings (
  setting_id integer NOT NULL DEFAULT nextval('"System_Settings_setting_id_seq"'::regclass),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text,
  setting_type character varying DEFAULT 'string'::character varying,
  category character varying,
  description text,
  is_public boolean DEFAULT false,
  updated_by integer,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT System_Settings_pkey PRIMARY KEY (setting_id),
  CONSTRAINT System_Settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.Admins(admin_id)
);