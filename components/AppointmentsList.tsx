
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Appointment } from '../types';
import { BANK_SERVICES } from '../constants';

interface AppointmentsListProps {
  appointments: Appointment[];
}

interface AppointmentCardProps {
  app: Appointment;
  category: 'active' | 'upcoming' | 'cancelled' | 'completed';
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments }) => {
  // Separate appointments into real user-generated categories
  const activeApps = useMemo(() => 
    appointments.filter(a => a.status === 'Arrived' || a.status === 'In Progress')
  , [appointments]);

  const upcomingApps = useMemo(() => 
    appointments.filter(a => a.status === 'Scheduled')
  , [appointments]);

  const cancelledApps = useMemo(() => 
    appointments.filter(a => a.status === 'Cancelled')
  , [appointments]);

  const completedApps = useMemo(() => 
    appointments.filter(a => a.status === 'Completed')
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
      cancelled: 'bg-red-50 border-red-200 ring-red-100',
      completed: 'bg-gray-50 border-gray-200 ring-gray-100'
    };

    const iconStyles = {
      active: 'bg-green-600 text-white',
      upcoming: 'bg-blue-600 text-white',
      cancelled: 'bg-red-600 text-white',
      completed: 'bg-gray-400 text-white'
    };

    const statusBadgeStyles = {
      active: 'bg-green-100 text-green-700',
      upcoming: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-gray-200 text-gray-700'
    };

    return (
      <div className={`p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${categoryStyles[category]}`}>
        <div className="flex gap-4 items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconStyles[category]}`}>
            <i className={`fas ${
              app.serviceId === 'open_account' ? 'fa-user-plus' :
              app.serviceId === 'loans' ? 'fa-hand-holding-usd' :
              app.serviceId === 'kyc_update' ? 'fa-id-card' : 'fa-university'
            }`}></i>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">{getServiceLabel(app.serviceId)}</h4>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              {dateStr} • {app.timeSlot}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter font-bold">Ref: {app.id}</p>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadgeStyles[category]}`}>
            {app.status}
          </span>
          {category === 'active' && (
            <Link to="/status" className="text-xs font-bold text-green-700 hover:underline inline-flex items-center">
              View Priority Tracker <i className="fas fa-chevron-right ml-1"></i>
            </Link>
          )}
          {category === 'upcoming' && (
            <Link to="/status" className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center">
              Prepare Documents <i className="fas fa-chevron-right ml-1"></i>
            </Link>
          )}
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, icon, color }: { title: string, icon: string, color: string }) => (
    <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${color}`}>
      <i className={`fas ${icon}`}></i>
      {title}
    </h3>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/30 mb-8">
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-10">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Bank Visit Appointments</h2>
        <p className="text-gray-500 mt-2">View and manage your real scheduled visits at SmartBank branches.</p>
      </header>

      {/* Active Section */}
      <section>
        <SectionHeader title="Active Appointments" icon="fa-broadcast-tower" color="text-green-700" />
        {activeApps.length > 0 ? (
          activeApps.map(app => <AppointmentCard key={app.id} app={app} category="active" />)
        ) : (
          <EmptyState message="No active check-ins at this moment." />
        )}
      </section>

      {/* Upcoming Section */}
      <section>
        <SectionHeader title="Upcoming Visits" icon="fa-calendar-alt" color="text-blue-700" />
        {upcomingApps.length > 0 ? (
          upcomingApps.map(app => <AppointmentCard key={app.id} app={app} category="upcoming" />)
        ) : (
          <EmptyState message="No upcoming appointments scheduled." />
        )}
      </section>

      {/* Cancelled Section */}
      <section>
        <SectionHeader title="Cancelled Visits" icon="fa-times-circle" color="text-red-700" />
        {cancelledApps.length > 0 ? (
          cancelledApps.map(app => <AppointmentCard key={app.id} app={app} category="cancelled" />)
        ) : (
          <EmptyState message="No cancelled appointments." />
        )}
      </section>

      {/* Completed Section */}
      <section>
        <SectionHeader title="Visit History" icon="fa-history" color="text-gray-600" />
        {completedApps.length > 0 ? (
          completedApps.map(app => <AppointmentCard key={app.id} app={app} category="completed" />)
        ) : (
          <EmptyState message="No past appointments found." />
        )}
      </section>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-calendar-plus text-5xl text-gray-200 mb-4"></i>
          <h4 className="text-lg font-bold text-gray-400">Time to schedule your first visit?</h4>
          <Link to="/dashboard" className="mt-4 inline-block bg-blue-900 text-white px-6 py-2 rounded-lg font-bold shadow-lg">
            Browse Bank Services
          </Link>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
