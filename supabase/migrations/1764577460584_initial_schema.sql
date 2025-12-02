-- Create table: loginsignupdatas
CREATE TABLE IF NOT EXISTS loginsignupdatas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    username text UNIQUE NOT NULL,
    email text UNIQUE NOT NULL,
    location text,
    time timestamp with time zone,
    date date,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_loginsignupdatas_email ON loginsignupdatas (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_loginsignupdatas_username ON loginsignupdatas (username);
ALTER TABLE loginsignupdatas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON loginsignupdatas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow select for own records" ON loginsignupdatas FOR SELECT USING (auth.uid() = id);

-- Create table: funneldatas
CREATE TABLE IF NOT EXISTS funneldatas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    stage text NOT NULL,
    value numeric NOT NULL,
    probability decimal NOT NULL,
    expected_revenue decimal NOT NULL,
    creation_date timestamp with time zone NOT NULL,
    expected_close_date timestamp with time zone NOT NULL,
    team_member text NOT NULL,
    progress_to_won decimal NOT NULL,
    last_interacted_on timestamp with time zone NOT NULL,
    next_step text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE  INDEX IF NOT EXISTS idx_funneldatas_created_by ON funneldatas (created_by);
CREATE  INDEX IF NOT EXISTS idx_funneldatas_stage ON funneldatas (stage);
ALTER TABLE funneldatas ADD CONSTRAINT fk_funneldatas_undefined FOREIGN KEY (undefined) REFERENCES loginsignupdatas(id);
ALTER TABLE funneldatas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON funneldatas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow select for own records" ON funneldatas FOR SELECT USING (auth.uid() = created_by);
