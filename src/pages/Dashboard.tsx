import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, Users, Bed, ArrowLeft, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    availableRooms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`*, rooms (name, type)`)
        .order('created_at', { ascending: false });
      if (bookingsError) throw bookingsError;

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('type', { ascending: true });
      if (roomsError) throw roomsError;

      setBookings(bookingsData || []);
      setRooms(roomsData || []);

      const totalBookings = bookingsData?.length || 0;
      const totalRevenue =
        bookingsData?.reduce(
          (sum, booking) =>
            sum +
            (booking.payment_status === 'completed'
              ? parseFloat(booking.total_price.toString())
              : 0),
          0
        ) || 0;

      const availableRooms = roomsData?.filter((room) => room.is_available).length || 0;
      const occupancyRate = roomsData?.length
        ? ((roomsData.length - availableRooms) / roomsData.length) * 100
        : 0;

      setStats({ totalBookings, totalRevenue, occupancyRate, availableRooms });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', bookingId);
      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const toggleRoomAvailability = async (roomId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase.from('rooms').update({ is_available: !isAvailable }).eq('id', roomId);
      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating room availability:', error);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const exportFinancialReportCSV = () => {
    try {
      const headers = [
        'Tanggal Booking',
        'Nama Tamu',
        'Email',
        'Telepon',
        'Kamar',
        'Check-in',
        'Check-out',
        'Jumlah Tamu',
        'Total Harga (IDR)',
        'Status Pembayaran',
        'Status Booking',
      ];

      const rows = bookings.map((b) => [
        new Date(b.created_at).toLocaleDateString('id-ID'),
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.rooms?.name || '-',
        new Date(b.check_in_date).toLocaleDateString('id-ID'),
        new Date(b.check_out_date).toLocaleDateString('id-ID'),
        b.guests_count,
        new Intl.NumberFormat('id-ID').format(b.total_price),
        b.payment_status,
        b.booking_status,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Laporan CSV berhasil diexport!');
    } catch (error) {
      console.error('Error exporting CSV report:', error);
      toast.error('Gagal mengexport laporan CSV');
    }
  };

  const exportFinancialReportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('THE GARDEN RESIDENCE', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('LAPORAN KEUANGAN', pageWidth / 2, 28, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const reportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Tanggal Laporan: ${reportDate}`, pageWidth / 2, 35, { align: 'center' });

      // Summary Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RINGKASAN KEUANGAN', 14, 45);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryData = [
        ['Total Booking', `: ${stats.totalBookings}`],
        ['Total Pendapatan', `: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalRevenue)}`],
        ['Tingkat Okupansi', `: ${stats.occupancyRate.toFixed(1)}%`],
        ['Kamar Tersedia', `: ${stats.availableRooms}`],
      ];

      let yPos = 52;
      summaryData.forEach(([label, value]) => {
        doc.text(label, 14, yPos);
        doc.text(value, 60, yPos);
        yPos += 6;
      });

      // Table
      const tableData = bookings.map((b) => [
        new Date(b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        b.guest_name,
        b.rooms?.name || '-',
        `${new Date(b.check_in_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} - ${new Date(b.check_out_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}`,
        b.guests_count.toString(),
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.total_price),
        b.booking_status === 'confirmed' ? 'Confirmed' : 'Cancelled',
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Tanggal', 'Nama Tamu', 'Kamar', 'Periode', 'Tamu', 'Total', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 25 },
          1: { halign: 'left', cellWidth: 35 },
          2: { halign: 'left', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 30 },
          4: { halign: 'center', cellWidth: 15 },
          5: { halign: 'right', cellWidth: 35 },
          6: { halign: 'center', cellWidth: 22 },
        },
        didDrawPage: (data) => {
          // Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(
            `Halaman ${data.pageNumber} dari ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        },
      });

      doc.save(`Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Laporan PDF berhasil diexport!');
    } catch (error) {
      console.error('Error exporting PDF report:', error);
      toast.error('Gagal mengexport laporan PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')} 
              className="text-muted-foreground hover:text-foreground -ml-2 sm:ml-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">The Garden Residence</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-base sm:text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Occupancy Rate</CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Available Rooms</CardTitle>
              <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.availableRooms}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile Optimized */}
        <Tabs defaultValue="bookings" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="rooms" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Room Management
            </TabsTrigger>
          </TabsList>

          {/* BOOKINGS - Mobile Optimized */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Recent Bookings</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Kelola semua reservasi hotel</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={exportFinancialReportCSV} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                      <Download className="h-4 w-4" /> 
                      <span className="hidden sm:inline">Export CSV</span>
                      <span className="sm:hidden">CSV</span>
                    </Button>
                    <Button onClick={exportFinancialReportPDF} size="sm" className="gap-2 w-full sm:w-auto">
                      <FileText className="h-4 w-4" /> 
                      <span className="hidden sm:inline">Export PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3 p-4">
                  {bookings.map((b) => (
                    <Card key={b.id} className="p-4 hover-scale">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{b.guest_name}</div>
                            <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                          </div>
                          <Badge variant={b.booking_status === 'confirmed' ? 'default' : 'destructive'} className="text-xs">
                            {b.booking_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Kamar:</span>
                            <div className="font-medium">{b.rooms?.name}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tamu:</span>
                            <div className="font-medium">{b.guests_count} orang</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Check-in:</span>
                            <div className="font-medium">{new Date(b.check_in_date).toLocaleDateString('id-ID')}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Check-out:</span>
                            <div className="font-medium">{new Date(b.check_out_date).toLocaleDateString('id-ID')}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Total:</span>
                            <div className="font-bold text-primary">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(b.total_price)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2 border-t">
                          {b.booking_status === 'confirmed' && (
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'cancelled')} className="flex-1 text-xs">
                              Cancel
                            </Button>
                          )}
                          {b.booking_status === 'cancelled' && (
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'confirmed')} className="flex-1 text-xs">
                              Restore
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)} className="flex-1 text-xs">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{b.guest_name}</div>
                              <div className="text-sm text-muted-foreground">{b.guest_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{b.rooms?.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(b.check_in_date).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">to {new Date(b.check_out_date).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>{b.guests_count}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(b.total_price)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={b.booking_status === 'confirmed' ? 'default' : 'destructive'}>
                              {b.booking_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {b.booking_status === 'confirmed' && (
                                <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'cancelled')}>Cancel</Button>
                              )}
                              {b.booking_status === 'cancelled' && (
                                <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'confirmed')}>Restore</Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROOMS - Mobile Optimized */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Room Management</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Kelola ketersediaan dan harga kamar</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3 p-4">
                  {rooms.map((r) => (
                    <Card key={r.id} className="p-4 hover-scale">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{r.name}</div>
                            <Badge variant="secondary" className="capitalize text-xs mt-1">
                              {r.type}
                            </Badge>
                          </div>
                          <Badge variant={r.is_available ? 'default' : 'destructive'} className="text-xs">
                            {r.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Kapasitas:</span>
                            <div className="font-medium">{r.capacity} tamu</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Harga/Malam:</span>
                            <div className="font-bold text-primary">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(r.price_per_night)}
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleRoomAvailability(r.id, r.is_available)}
                          className="w-full text-xs"
                        >
                          {r.is_available ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Price/Night</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{r.type}</Badge>
                          </TableCell>
                          <TableCell>{r.capacity} guests</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(r.price_per_night)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={r.is_available ? 'default' : 'destructive'}>
                              {r.is_available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => toggleRoomAvailability(r.id, r.is_available)}>
                              {r.is_available ? 'Disable' : 'Enable'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
