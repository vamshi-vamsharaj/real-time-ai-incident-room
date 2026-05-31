import IncidentCard from './IncidentCard';
import EmptyState from '../../../shared/components/EmptyState';

const IncidentList = ({ incidents, onCreateClick }) => {
  if (incidents.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident._id} incident={incident} />
      ))}
    </div>
  );
};

export default IncidentList;