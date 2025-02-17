import { useState } from 'react';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'nut-free', label: 'Nut-free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
];

const cuisinePreferences = [
  { id: 'american', label: 'American' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'italian', label: 'Italian' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'thai', label: 'Thai' },
  { id: 'indian', label: 'Indian' },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [maxRadius, setMaxRadius] = useState(5);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email: user.email,
        photoURL: user.photoURL,
        preferences: {
          maxRadius,
          dietaryRestrictions,
          favoriteCuisines,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create profile');
      setLoading(false);
    }
  };

  const toggleDietaryRestriction = (id: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleCuisine = (id: string) => {
    setFavoriteCuisines(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Complete Your Profile
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Help us personalize your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label
                htmlFor="display-name"
                className="block text-sm font-medium text-gray-700"
              >
                Display Name
              </label>
              <div className="mt-1">
                <input
                  id="display-name"
                  name="display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="max-radius"
                className="block text-sm font-medium text-gray-700"
              >
                Maximum Search Radius (miles)
              </label>
              <div className="mt-1">
                <input
                  id="max-radius"
                  name="max-radius"
                  type="range"
                  min="1"
                  max="10"
                  value={maxRadius}
                  onChange={(e) => setMaxRadius(Number(e.target.value))}
                  className="block w-full"
                />
                <div className="mt-1 text-center text-sm text-gray-600">
                  {maxRadius} miles
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dietary Restrictions
              </label>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {dietaryOptions.map((option) => (
                  <div
                    key={option.id}
                    className="relative flex items-start"
                  >
                    <div className="flex h-5 items-center">
                      <input
                        id={`dietary-${option.id}`}
                        type="checkbox"
                        checked={dietaryRestrictions.includes(option.id)}
                        onChange={() => toggleDietaryRestriction(option.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`dietary-${option.id}`}
                        className="font-medium text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Favorite Cuisines
              </label>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cuisinePreferences.map((cuisine) => (
                  <div
                    key={cuisine.id}
                    className="relative flex items-start"
                  >
                    <div className="flex h-5 items-center">
                      <input
                        id={`cuisine-${cuisine.id}`}
                        type="checkbox"
                        checked={favoriteCuisines.includes(cuisine.id)}
                        onChange={() => toggleCuisine(cuisine.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`cuisine-${cuisine.id}`}
                        className="font-medium text-gray-700"
                      >
                        {cuisine.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}