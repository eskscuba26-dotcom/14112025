import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductionStockPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${API}/production-stock`);
      setStock(response.data);
    } catch (error) {
      toast.error('Stok verileri yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.kalinlik?.toString().includes(search) ||
      item.en?.toString().includes(search) ||
      item.boy?.toString().includes(search) ||
      item.renk?.toLowerCase().includes(search)
    );
  });

  const totalAdet = filteredStock.reduce((sum, item) => sum + (item.adet || 0), 0);
  const totalMetrekare = filteredStock.reduce((sum, item) => sum + (item.metrekare || 0), 0);

  if (loading) {
    return <div className="text-center py-10">Yukleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Uretim Stok</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Toplam Adet</p>
            <p className="text-2xl font-bold">{totalAdet}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Toplam Metrekare</p>
            <p className="text-2xl font-bold">{totalMetrekare.toFixed(2)} m2</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Input
          placeholder="Ara (Kalinlik, En, Boy, Renk)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kalinlik (mm)</TableHead>
                  <TableHead>En (cm)</TableHead>
                  <TableHead>Boy (cm)</TableHead>
                  <TableHead>Renk</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead>Metrekare (m2)</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Stokta urun bulunamadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.kalinlik}</TableCell>
                      <TableCell>{item.en}</TableCell>
                      <TableCell>{item.boy}</TableCell>
                      <TableCell>
                        {item.renk ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            {item.renk}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Normal</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{item.adet}</TableCell>
                      <TableCell className="font-semibold">
                        {item.metrekare?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.adet > 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Stokta
                          </span>
                        ) : item.adet === 0 ? (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            Tukendi
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Eksi Stok
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Bilgilendirme</h3>
        <p className="text-sm text-blue-800">
          Uretim Stok, Uretim Girisinden gelen urunlerin Sevkiyat ve Kesilmis Urun islemlerinden
          sonra kalan miktarini gosterir. Renk bilgisi de dahil edilmistir.
        </p>
      </div>
    </div>
  );
}
