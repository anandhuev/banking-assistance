import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Appointment } from '../types';
import { BANK_SERVICES } from '../constants';

interface AppointmentsListProps {
  appointments: Appointment[];
}

interface AppointmentCardProps {
  app: Appointment;
  category: 'active' | 'upcoming' | 'missed' | 'cancelled' | 'completed' | 'expired';
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments }) => {
  const activeApps = useMemo(() => 
    appointments.filter(a => a.status === 'Arrived' || a.status === 'In Progress')
  , [appointments]);

  const upcomingApps = useMemo(() => 
    appointments.filter(a => a.status === 'Scheduled')
  , [appointments]);

  const missedApps = useMemo(() => 
    appointments.filter(a => a.status === 'Missed')
  , [appointments]);

  const cancelledApps = useMemo(() => 
    appointments.filter(a => a.status === 'Cancelled')
  , [appointments]);

  const historyApps = useMemo(() => 
    appointments.filter(a => a.status === 'Completed' || a.status === 'Expired')
  , [appointments]);

  const getServiceLabel = (id: string) => {
    return BANK_SERVICES.find(s => s.id === id)?.label || 'Bank Service';
  };

  const AppointmentCard: React.FC<AppointmentCardProps> = ({ app, category }) => {
    const dateStr = new Date(app.createdAt).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const categoryStyles = {
      active: 'bg-green-50 border-green-200 ring-green-100',
      upcoming: 'bg-blue-50 border-blue-200 ring-blue-100',
      missed: 'bg-orange-50 border-orange-200 ring-orange-100',
      cancelled: 'bg-red-50 border-red-200 ring-red-100',
      completed: 'bg-gray-50 border-gray-200 ring-gray-100',
      expired: 'bg-gray-100 border-gray-300 ring-gray-200 opacity-70'
    };

    const iconStyles = {
      active: 'bg-green-600 text-white',
      upcoming: 'bg-blue-600 text-white',
      missed: 'bg-orange-600 text-white',
      cancelled: 'bg-red-600 text-white',
      completed: 'bg-gray-400 text-white',
      expired: 'bg-gray-300 text-white'
    };

    const statusBadgeStyles = {
      active: 'bg-green-100 text-green-700',
      upcoming: 'bg-blue-100 text-blue-700',
      missed: 'bg-orange-100 text-orange-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-gray-200 text-gray-700',
      expired: 'bg-gray-300 text-gray-800'
    };

    return (
      <div className={`p-8 rounded-2xl border-2 shadow-sm transition-all hover:shadow-lg mb-6 flex flex-col md:flex-row justify-between md:items-center gap-6 ${categoryStyles[category]}`}>
        <div className="flex gap-6 items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md ${iconStyles[category]}`}>
            <i className={`fas ${
              app.serviceId === 'open_account' ? 'fa-user-plus' :
              app.serviceId === 'loans' ? 'fa-hand-holding-usd' :
              app.serviceId === 'kyc_update' ? 'fa-id-card' : 'fa-university'
            }`}></i>
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 leading-tight">{getServiceLabel(app.serviceId)}</h4>
            <p className="text-sm text-gray-600 font-bold mt-1">{dateStr} • {app.timeSlot}</p>
            <p className="text-[11px] text-gray-400 mt-1.5 uppercase tracking-widest font-black">Official Ref: {app.id}</p>
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-3">
          <span className={`self-start md:self-auto px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${statusBadgeStyles[category]}`}>
            {app.status}
          </span>
          {['active', 'upcoming', 'missed'].includes(category) && (
            <Link to="/status" className="text-sm font-black text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 transition-all">
              Live Priority Tracker <i className="fas fa-chevron-right text-xs"></i>
            </Link>
          )}
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, icon, color }: { title: string, icon: string, color: string }) => (
    <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${color} border-b pb-4 border-gray-100`}>
      <i className={`fas ${icon}`}></i> {title}
    </h3>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="p-10 border-4 border-dashed border-gray-100 rounded-3xl text-center bg-gray-50/20 mb-12">
      <p className="text-gray-400 font-bold">{message}</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-[1500px] mx-auto pb-16">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">XYZ Bank Appointments</h2>
        <p className="text-gray-500 font-bold mt-2">Manage your official visits and document compliance in one place.</p>
      </header>

      <section>
        <SectionHeader title="Active & Upcoming Visits" icon="fa-calendar-alt" color="text-blue-900" />
        {activeApps.length > 0 || upcomingApps.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {activeApps.map(app => <AppointmentCard key={app.id} app={app} category="active" />)}
            {upcomingApps.map(app => <AppointmentCard key={app.id} app={app} category="upcoming" />)}
          </div>
        ) : <EmptyState message="No current scheduled activity." />}
      </section>

      {missedApps.length > 0 && (
        <section>
          <SectionHeader title="Missed Schedules" icon="fa-exclamation-circle" color="text-orange-700" />
          {missedApps.map(app => <AppointmentCard key={app.id} app={app} category="missed" />)}
        </section>
      )}

      {(cancelledApps.length > 0 || historyApps.length > 0) && (
        <section>
          <SectionHeader title="Account Activity History" icon="fa-history" color="text-gray-500" />
          <div className="grid grid-cols-1 gap-2">
            {cancelledApps.map(app => <AppointmentCard key={app.id} app={app} category="cancelled" />)}
            {historyApps.map(app => <AppointmentCard key={app.id} app={app} category={app.status === 'Completed' ? 'completed' : 'expired'} />)}
          </div>
        </section>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <i className="fas fa-calendar-plus text-7xl text-gray-100 mb-6"></i>
          <h4 className="text-2xl font-black text-gray-400">Schedule your first visit</h4>
          <Link to="/dashboard" className="mt-8 inline-block bg-blue-900 text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-blue-800 transition-all">Browse Banking Services</Link>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;