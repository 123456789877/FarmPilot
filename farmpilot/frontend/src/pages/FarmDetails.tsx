import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFarm, getFields, getCrops } from '../services/api';
import { Farm, Field, CropCycle } from '../types';

export default function FarmDetails() {
  const { id } = useParams();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<CropCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getFarm(Number(id)),
      getFields(Number(id)),
      getCrops(),
    ]).then(([f, fld, c]) => {
      setFarm(f.data);
      setFields(fld.data);
      setCrops(c.data.filter((x: CropCycle) => fld.data.some((fi: Field) => fi.id === x.field_id)));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;
  if (!farm) return <p>Farm not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/farms" className="text-sm text-primary-600">← Back to Farms</Link>
        <h2 className="text-2xl font-bold mt-1">{farm.name}</h2>
        <p className="text-gray-500">{farm.location} · {farm.total_area} acres</p>
      </div>
      <div className="card grid md:grid-cols-3 gap-4 text-sm">
        <div><span className="text-gray-400">Soil Type</span><p className="font-medium">{farm.soil_type || '—'}</p></div>
        <div><span className="text-gray-400">Irrigation</span><p className="font-medium">{farm.irrigation_type || '—'}</p></div>
        <div><span className="text-gray-400">Description</span><p className="font-medium">{farm.description || '—'}</p></div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Fields ({fields.length})</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {fields.map(f => (
            <div key={f.id} className="card">
              <p className="font-medium">{f.name}</p>
              <p className="text-sm text-gray-500">{f.area} acres · {f.status}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Active Crop Cycles</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {crops.map(c => (
            <div key={c.id} className="card">
              <p className="font-medium">{c.crop_name} {c.variety && `(${c.variety})`}</p>
              <p className="text-sm text-gray-500">Stage: {c.current_growth_stage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
