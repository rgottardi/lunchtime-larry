import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { UsersIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActive: Date;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      try {
        // Get all groups where user is a member
        const groupsRef = collection(db, 'groups');
        const membershipQuery = query(
          collection(db, `groups`),
          where('members', 'array-contains', user.uid)
        );

        const snapshot = await getDocs(membershipQuery);
        const groupsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastActive: doc.data().lastActive?.toDate() || new Date(),
        })) as Group[];

        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {/* Quick Actions */}
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href="/groups/new" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Create New Group</p>
                    <p className="truncate text-sm text-gray-500">Start a new lunch group</p>
                  </Link>
                </div>
              </div>
              <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href="/restaurants" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Find Restaurant</p>
                    <p className="truncate text-sm text-gray-500">Browse nearby restaurants</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Groups */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Your Groups</h2>
            <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {loading ? (
                  <li className="px-6 py-4">Loading...</li>
                ) : groups.length === 0 ? (
                  <li className="px-6 py-4 text-sm text-gray-500">
                    No groups yet. Create or join a group to get started!
                  </li>
                ) : (
                  groups.map((group) => (
                    <li key={group.id}>
                      <Link 
                        href={`/groups/${group.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="truncate">
                              <div className="flex">
                                <p className="truncate text-sm font-medium text-indigo-600">
                                  {group.name}
                                </p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <UsersIcon 
                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <p>{group.memberCount} members</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-2 flex flex-shrink-0">
                              <p className="inline-flex text-xs text-gray-500">
                                Last active{' '}
                                {formatDistanceToNow(group.lastActive, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}