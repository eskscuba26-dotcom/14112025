import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== AUTH CONTEXT ====================
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

// ==================== LOGIN PAGE ====================
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        login(response.data.user);
        toast.success('Giriş başarılı!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img
            src="/company-logo.jpeg"
            alt="SAR Ambalaj"
            className="mx-auto h-24 w-24 object-contain rounded-lg"
          />
          <CardTitle className="text-2xl font-bold">Üretim Takip Sistemi</CardTitle>
          <p className="text-sm text-gray-600">Güvenli giriş yapın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== LAYOUT ====================
function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Ana Sayfa', path: '/dashboard' },
    { name: 'Üretim Girişi', path: '/production' },
    { name: 'Kesilmiş Ürün', path: '/cut-products' },
    { name: 'Sevkiyat', path: '/shipments' },
    { name: 'Üretim Stok', path: '/production-stock' },
    { name: 'Hammadde Yönetimi', path: '/raw-materials' },
    { name: 'Ekstra Malzemeler', path: '/extra-materials' },
    { name: 'Hammadde Stok', path: '/raw-material-stock' },
    { name: 'Günlük Tüketim', path: '/daily-consumption' },
    { name: 'Gaz Girişi', path: '/gas-entries' },
    { name: 'Maliyet Analizi', path: '/cost-analysis' },
    { name: 'Aylık Rapor', path: '/monthly-report' },
    { name: 'Excel Dışa Aktar', path: '/excel-export' },
    { name: 'Manuel Maliyet', path: '/manual-cost' },
    { name: 'Raporlama', path: '/reporting' },
    { name: 'Kurlar', path: '/exchange-rates' },
    { name: 'Kullanıcı Yönetimi', path: '/users' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-blue-800 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {sidebarOpen && <h1 className="text-xl font-bold">SAR Ambalaj</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-blue-700"
          >
            {sidebarOpen ? '←' : '→'}
          </Button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-blue-700 hover:text-white"
              >
                {sidebarOpen ? item.name : item.name.substring(0, 2)}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-blue-200">{user?.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Button
              variant="ghost"
              className="w-full mt-2 text-white hover:bg-blue-700"
              onClick={logout}
            >
              Çıkış Yap
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hoş Geldiniz</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Üretim Kayıtları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.uretim_kayitlari || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kesilmiş Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.kesilmis_urunler || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sevkiyatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.sevkiyatlar || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hammaddeler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.hammaddeler || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gaz Girişleri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.gaz_girisleri || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Maliyet Analizleri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.maliyet_analizleri || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Raw Material Stock Status */}
      <Card>
        <CardHeader>
          <CardTitle>Hammadde Stok Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.hammadde_stok &&
              Object.entries(stats.hammadde_stok).map(([name, data]) => (
                <div key={name} className="border-b pb-3">
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-600">Alınan</p>
                      <p className="text-lg font-bold text-green-600">
                        {data.alinan.toFixed(2)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kullanılan</p>
                      <p className="text-lg font-bold text-orange-600">
                        {data.kullanilan.toFixed(2)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kalan</p>
                      <p
                        className={`text-lg font-bold ${
                          data.kalan < 0 ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {data.kalan.toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder for other pages - will be implemented in next part
function ProductionPage() {
  return <div className="text-center py-10">Üretim Girişi - Yükleniyor...</div>;
}

function CutProductsPage() {
  return <div className="text-center py-10">Kesilmiş Ürün - Yükleniyor...</div>;
}

function ShipmentsPage() {
  return <div className="text-center py-10">Sevkiyat - Yükleniyor...</div>;
}

function ProductionStockPage() {
  return <div className="text-center py-10">Üretim Stok - Yükleniyor...</div>;
}

function RawMaterialsPage() {
  return <div className="text-center py-10">Hammadde Yönetimi - Yükleniyor...</div>;
}

function ExtraMaterialsPage() {
  return <div className="text-center py-10">Ekstra Malzemeler - Yükleniyor...</div>;
}

function RawMaterialStockPage() {
  return <div className="text-center py-10">Hammadde Stok - Yükleniyor...</div>;
}

function DailyConsumptionPage() {
  return <div className="text-center py-10">Günlük Tüketim - Yükleniyor...</div>;
}

function GasEntriesPage() {
  return <div className="text-center py-10">Gaz Girişi - Yükleniyor...</div>;
}

function CostAnalysisPage() {
  return <div className="text-center py-10">Maliyet Analizi - Yükleniyor...</div>;
}

function MonthlyReportPage() {
  return <div className="text-center py-10">Aylık Rapor - Yükleniyor...</div>;
}

function ExcelExportPage() {
  return <div className="text-center py-10">Excel Dışa Aktar - Yükleniyor...</div>;
}

function ManualCostPage() {
  return <div className="text-center py-10">Manuel Maliyet - Yükleniyor...</div>;
}

function ReportingPage() {
  return <div className="text-center py-10">Raporlama - Yükleniyor...</div>;
}

function ExchangeRatesPage() {
  return <div className="text-center py-10">Kurlar - Yükleniyor...</div>;
}

function UsersPage() {
  return <div className="text-center py-10">Kullanıcı Yönetimi - Yükleniyor...</div>;
}

// ==================== MAIN APP ====================
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/cut-products" element={<CutProductsPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/production-stock" element={<ProductionStockPage />} />
        <Route path="/raw-materials" element={<RawMaterialsPage />} />
        <Route path="/extra-materials" element={<ExtraMaterialsPage />} />
        <Route path="/raw-material-stock" element={<RawMaterialStockPage />} />
        <Route path="/daily-consumption" element={<DailyConsumptionPage />} />
        <Route path="/gas-entries" element={<GasEntriesPage />} />
        <Route path="/cost-analysis" element={<CostAnalysisPage />} />
        <Route path="/monthly-report" element={<MonthlyReportPage />} />
        <Route path="/excel-export" element={<ExcelExportPage />} />
        <Route path="/manual-cost" element={<ManualCostPage />} />
        <Route path="/reporting" element={<ReportingPage />} />
        <Route path="/exchange-rates" element={<ExchangeRatesPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Layout>
  );
}

function AppWithProviders() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppWithProviders;
