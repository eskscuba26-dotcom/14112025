import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ExcelExportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Excel Dışa Aktar</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-gray-600">Raporlarınızı Excel formatında dışa aktarabilirsiniz.</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">Üretim Girişi Raporu - Excel</Button>
            <Button variant="outline" className="w-full">Sevkiyat Raporu - Excel</Button>
            <Button variant="outline" className="w-full">Hammadde Raporu - Excel</Button>
            <Button variant="outline" className="w-full">Tüm Veriler - Excel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
