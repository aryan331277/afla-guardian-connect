-- Create function to update government analytics when buyer scans are created
CREATE OR REPLACE FUNCTION update_government_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update monthly analytics data
  INSERT INTO government_analytics (
    total_scans, 
    total_buyers, 
    average_risk_score, 
    high_risk_scans, 
    month_year
  )
  VALUES (
    1, -- initial scan count
    1, -- initial buyer count
    NEW.risk_score::numeric, -- risk score from the scan
    CASE WHEN NEW.risk_score >= 70 THEN 1 ELSE 0 END, -- high risk threshold
    date_trunc('month', NOW())
  )
  ON CONFLICT (month_year) DO UPDATE SET
    total_scans = government_analytics.total_scans + 1,
    average_risk_score = (
      (government_analytics.average_risk_score * government_analytics.total_scans + NEW.risk_score::numeric) 
      / (government_analytics.total_scans + 1)
    ),
    high_risk_scans = government_analytics.high_risk_scans + 
      CASE WHEN NEW.risk_score >= 70 THEN 1 ELSE 0 END;
      
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update analytics
DROP TRIGGER IF EXISTS trigger_update_government_analytics ON buyer_scans;
CREATE TRIGGER trigger_update_government_analytics
  AFTER INSERT ON buyer_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_government_analytics();

-- Check if constraint exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_month_year' 
        AND table_name = 'government_analytics'
    ) THEN
        ALTER TABLE government_analytics 
        ADD CONSTRAINT unique_month_year UNIQUE (month_year);
    END IF;
END $$;