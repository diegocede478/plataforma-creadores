/* ========================================
   Creata - Services Manager View
   ======================================== */

import { useState, type FormEvent } from 'react';
import {
  Package, Plus, Pencil, Trash2, DollarSign, Clock,
  AlertTriangle, Power, Eye, CheckCircle2
} from 'lucide-react';
import { useMyServices, useCreateService, useUpdateService, useDeleteService } from '../hooks';
import { Button, Card, Badge, Input, Textarea, Modal, SkeletonCard } from '../components/ui';
import type { Service } from '../types';
import './ServicesManager.css';

interface ServiceFormState {
  title: string;
  description: string;
  price: string;
  deliveryDays: string;
}

const EMPTY_FORM: ServiceFormState = {
  title: '',
  description: '',
  price: '',
  deliveryDays: '',
};

export function ServicesManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM);

  const { data: services, isLoading } = useMyServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const openCreateModal = () => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description,
      price: String(service.price),
      deliveryDays: String(service.deliveryDays),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (createService.isPending || updateService.isPending) return;
    setModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      deliveryDays: Number(form.deliveryDays),
    };

    if (editingService) {
      updateService.mutate({ id: editingService.id, data: payload }, {
        onSuccess: () => closeModal(),
      });
    } else {
      createService.mutate(payload, {
        onSuccess: () => closeModal(),
      });
    }
  };

  const toggleStatus = (service: Service) => {
    const nextStatus = service.status === 'active' ? 'paused' : 'active';
    updateService.mutate({ id: service.id, data: { status: nextStatus } });
  };

  const confirmDelete = () => {
    if (!deletingService) return;
    deleteService.mutate(deletingService.id, {
      onSuccess: () => setDeletingService(null),
    });
  };

  const isSubmitting = createService.isPending || updateService.isPending;

  return (
    <div className="services-manager">
      <div className="services-manager__header">
        <div>
          <h2 className="services-manager__title">Servicios</h2>
          <p className="services-manager__subtitle">
            Ofrece gigs y servicios a tus seguidores
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Nuevo servicio
        </Button>
      </div>

      {isLoading ? (
        <div className="services-manager__grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !services || services.length === 0 ? (
        <Card variant="glass" className="services-manager__empty">
          <div className="services-manager__empty-icon">
            <Package size={48} />
          </div>
          <h3>Sin servicios</h3>
          <p>Ofrece tu primer servicio para empezar a ganar dinero con tus habilidades.</p>
          <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
            Crear servicio
          </Button>
        </Card>
      ) : (
        <div className="services-manager__grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => openEditModal(service)}
              onDelete={() => setDeletingService(service)}
              onToggleStatus={() => toggleStatus(service)}
              statusUpdating={updateService.isPending}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingService ? 'Editar servicio' : 'Nuevo servicio'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="services-manager__form">
          <div className="services-manager__form-grid">
            <div className="services-manager__form-group">
              <Input
                label="Título"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Edición de video 60s"
                required
              />
            </div>
            <div className="services-manager__form-group">
              <Input
                label="Precio (USD)"
                type="number"
                min="1"
                step="0.5"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="25.00"
                leftIcon={<DollarSign size={16} />}
                required
              />
            </div>
          </div>

          <div className="services-manager__form-group">
            <Textarea
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe qué incluye tu servicio, plazos, revisiones..."
              rows={4}
              required
            />
          </div>

          <div className="services-manager__form-group">
            <Input
              label="Días de entrega"
              type="number"
              min="1"
              max="90"
              value={form.deliveryDays}
              onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
              placeholder="3"
              leftIcon={<Clock size={16} />}
              required
            />
            <p className="services-manager__form-hint">
              Tiempo estimado para entregar el servicio al comprador.
            </p>
          </div>

          <div className="services-manager__form-actions">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !form.title.trim() || !form.description.trim() || !form.price || !form.deliveryDays}
              leftIcon={<Plus size={16} />}
            >
              {isSubmitting ? 'Guardando...' : editingService ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingService}
        onClose={() => !deleteService.isPending && setDeletingService(null)}
        title="Eliminar servicio"
        size="sm"
      >
        <div className="services-manager__confirm">
          <div className="services-manager__confirm-icon">
            <AlertTriangle size={32} />
          </div>
          <p className="services-manager__confirm-text">
            ¿Estás seguro de que quieres eliminar el servicio "{deletingService?.title}"?
            Esta acción no se puede deshacer.
          </p>
          <div className="services-manager__confirm-actions">
            <Button
              variant="ghost"
              onClick={() => setDeletingService(null)}
              disabled={deleteService.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteService.isPending}
              leftIcon={<Trash2 size={16} />}
            >
              {deleteService.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  statusUpdating: boolean;
}

function ServiceCard({ service, onEdit, onDelete, onToggleStatus, statusUpdating }: ServiceCardProps) {
  const statusInfo = {
    active: { label: 'Activo', variant: 'success' as const, icon: <Eye size={12} /> },
    paused: { label: 'Pausado', variant: 'warning' as const, icon: <Power size={12} /> },
    inactive: { label: 'Inactivo', variant: 'default' as const, icon: <CheckCircle2 size={12} /> },
  }[service.status];

  return (
    <Card variant="glass" className="service-card">
      <div className="service-card__header">
        <Badge variant={statusInfo.variant} size="sm" className="service-card__status">
          {statusInfo.icon} {statusInfo.label}
        </Badge>
        <span className="service-card__price">
          <DollarSign size={16} /> {service.price.toFixed(2)}
        </span>
      </div>

      <h3 className="service-card__title">{service.title}</h3>
      <p className="service-card__description">
        {service.description.length > 120 ? `${service.description.slice(0, 120)}...` : service.description}
      </p>

      <div className="service-card__meta">
        <span className="service-card__delivery">
          <Clock size={14} /> {service.deliveryDays} día{service.deliveryDays !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="service-card__footer">
        <div className="service-card__actions">
          <Button variant="ghost" size="sm" onClick={onToggleStatus} disabled={statusUpdating} aria-label={service.status === 'active' ? 'Pausar servicio' : 'Activar servicio'}>
            {service.status === 'active' ? <Power size={16} /> : <Eye size={16} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Editar servicio">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Eliminar servicio" className="service-card__delete">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ServicesManager;
