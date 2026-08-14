CREATE POLICY "read own physique photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "upload own physique photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "update own physique photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "delete own physique photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);