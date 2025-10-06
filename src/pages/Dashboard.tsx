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
    if (user) {
      fetchDashboardData();
    }
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

  // === EXPORT LAPORAN KEUANGAN CSV ===
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

  // === EXPORT LAPORAN KEUANGAN PDF ===
  const exportFinancialReportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      doc.setFontSize(18).setFont('helvetica', 'bold');
      doc.text('THE GARDEN RESIDENCE', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(14).text('LAPORAN KEUANGAN', pageWidth / 2, 28, { align: 'center' });

      const reportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(`Tanggal Laporan: ${reportDate}`, pageWidth / 2, 35, { align: 'center' });

      doc.setFontSize(12).setFont('helvetica', 'bold').text('RINGKASAN KEUANGAN', 14, 45);
      doc.setFontSize(10).setFont('helvetica', 'normal');
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
        headStyles: { fillColor: [34, 197, 94], textColor: 255, halign: 'center' },
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
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8).setFont('helvetica', 'italic');
          doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">The Garden Residence Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>

        {/* === STATS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Bookings</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalBookings}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.totalRevenue)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Available Rooms</CardTitle><Bed className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.availableRooms}</div></CardContent></Card>
        </div>

        {/* === TAB MENU === */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
          </TabsList>

          {/* BOOKINGS TABLE */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Manage and track all hotel reservations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportFinancialReportCSV} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={exportFinancialReportPDF} className="gap-2">
                      <FileText className="h-4 w-4" /> Export PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(b.total_price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={b.booking_status === 'confirmed' ? 'default' : b.booking_status === 'cancelled' ? 'destructive' : 'secondary'}>
                            {b.booking_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {b.booking_status === 'confirmed' && (
                              <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'cancelled')}>
                                Cancel
                              </Button>
                            )}
                            {b.booking_status === 'cancelled' && (
                              <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'confirmed')}>
                                Restore
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROOMS TABLE */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Room Management</CardTitle>
                <CardDescription>Manage room availability and pricing</CardDescription>
              </CardHeader>
              <CardContent>
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
                          <Badge variant="secondary" className="capitalize">
                            {r.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.capacity} guests</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.price_per_night)}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
