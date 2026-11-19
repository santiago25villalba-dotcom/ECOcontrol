-- Solo si ya tenias la base creada antes de agregar los pagos simulados:
ALTER TABLE asesorias
  ADD COLUMN metodo_pago VARCHAR(40) NULL AFTER mensaje,
  ADD COLUMN monto INT NULL AFTER metodo_pago,
  ADD COLUMN pago_estado ENUM('Pendiente','Aprobado') NULL AFTER monto,
  ADD COLUMN referencia VARCHAR(20) NULL AFTER pago_estado;
