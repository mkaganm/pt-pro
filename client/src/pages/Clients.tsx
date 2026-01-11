import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import ClientCard from '../components/clients/ClientCard';
import { useClientStore } from '../store/useClientStore';
import type { CreateClientRequest } from '../types';

export default function Clients() {
    const { clients, isLoading, fetchClients, createClient } = useClientStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateClientRequest>({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        total_package_size: 10,
    });

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = clients.filter((client) => {
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClient(formData);
            setIsModalOpen(false);
            setFormData({
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                total_package_size: 10,
            });
        } catch (error) {
            console.error('Failed to create client:', error);
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clients</h1>
                    <p className="text-gray-400 mt-1">{clients.length} total clients</p>
                </div>
                <Button icon={<Plus className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
                    Add Client
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12"
                />
            </div>

            {/* Client List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">
                        {searchQuery ? 'No clients found matching your search' : 'No clients yet. Add your first client!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredClients.map((client) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}

            {/* Add Client Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Client"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                        />
                        <Input
                            label="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        label="Package Size (Sessions)"
                        type="number"
                        min="1"
                        value={formData.total_package_size}
                        onChange={(e) => setFormData({ ...formData, total_package_size: parseInt(e.target.value) || 0 })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Client
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
