import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ExchangeRatesPage() {
  const [usd, setUsd] = useState('');
  const [eur, setEur] = useState('');

  const handleSave = () => {
    toast.success('Kurlar kaydedildi');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kurlar</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Güncel Kurlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>USD Kuru</Label>
            <Input type="number" step="0.01" value={usd} onChange={(e) => setUsd(e.target.value)} placeholder="Örn: 32.50" />
          </div>
          <div>
            <Label>EUR Kuru</Label>
            <Input type="number" step="0.01" value={eur} onChange={(e) => setEur(e.target.value)} placeholder="Örn: 35.20" />
          </div>
          <Button onClick={handleSave} className="w-full">Kaydet</Button>
        </CardContent>
      </Card>
    </div>
  );
}
