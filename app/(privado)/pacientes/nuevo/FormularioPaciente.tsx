'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'

import { crearPaciente } from '../acciones'
import { Area, BotonEnviar, Campo, Seccion, Selector, Texto } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

const estadoInicial: ResultadoAccion | null = null

export function FormularioPaciente() {
  const [estado, accion] = useFormState(crearPaciente, estadoInicial)
  const e = estado && !estado.ok ? (estado.campos ?? {}) : {}

  return (
    <form action={accion} className="space-y-4">
      {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}

      <Seccion titulo="Datos de base">
        <Campo etiqueta="Nombre" nombre="firstName" error={e.firstName} requerido>
          <Texto nombre="firstName" error={e.firstName} autoComplete="off" required />
        </Campo>
        <Campo etiqueta="Apellido" nombre="lastName" error={e.lastName} requerido>
          <Texto nombre="lastName" error={e.lastName} autoComplete="off" required />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento" nombre="birthDate" error={e.birthDate} requerido>
          <Texto nombre="birthDate" type="date" error={e.birthDate} required />
        </Campo>
        <Campo etiqueta="Sexo" nombre="sex">
          <Selector
            nombre="sex"
            defaultValue="no_declara"
            opciones={[
              { valor: 'femenino', texto: 'Femenino' },
              { valor: 'masculino', texto: 'Masculino' },
              { valor: 'otro', texto: 'Otro' },
              { valor: 'no_declara', texto: 'Prefiere no declararlo' },
            ]}
          />
        </Campo>
        <Campo
          etiqueta="Edad al inicio de la miopia"
          nombre="myopiaOnsetAge"
          error={e.myopiaOnsetAge}
          ayuda="En anos. Acepta decimales"
        >
          <Texto
            nombre="myopiaOnsetAge"
            inputMode="decimal"
            placeholder="8"
            error={e.myopiaOnsetAge}
          />
        </Campo>
        <Campo etiqueta="Padres miopes" nombre="myopicParents" error={e.myopicParents}>
          <Selector
            nombre="myopicParents"
            defaultValue=""
            opciones={[
              { valor: '', texto: 'Sin dato' },
              { valor: '0', texto: 'Ninguno' },
              { valor: '1', texto: 'Uno' },
              { valor: '2', texto: 'Dos' },
            ]}
          />
        </Campo>
        <Campo etiqueta="Tipo de documento" nombre="documentType">
          <Selector
            nombre="documentType"
            defaultValue=""
            opciones={[
              { valor: '', texto: 'Sin dato' },
              { valor: 'RC', texto: 'Registro civil' },
              { valor: 'TI', texto: 'Tarjeta de identidad' },
              { valor: 'CC', texto: 'Cedula de ciudadania' },
              { valor: 'CE', texto: 'Cedula de extranjeria' },
              { valor: 'PA', texto: 'Pasaporte' },
            ]}
          />
        </Campo>
        <Campo etiqueta="Numero de documento" nombre="documentNumber">
          <Texto nombre="documentNumber" inputMode="numeric" autoComplete="off" />
        </Campo>
        <Campo etiqueta="Oftalmologia pediatrica" nombre="ophthalmologistName">
          <Texto nombre="ophthalmologistName" autoComplete="off" />
        </Campo>
        <Campo etiqueta="Institucion" nombre="institutionName">
          <Texto nombre="institutionName" autoComplete="off" />
        </Campo>
      </Seccion>

      <Seccion
        titulo="Familia"
        descripcion="Quien va a registrar el uso diario desde el telefono"
      >
        <Campo etiqueta="Nombre del cuidador" nombre="caregiverName">
          <Texto nombre="caregiverName" autoComplete="off" />
        </Campo>
        <Campo
          etiqueta="Correo del cuidador"
          nombre="caregiverEmail"
          error={e.caregiverEmail}
          ayuda="Con este correo se le dara acceso a la vista de la familia"
        >
          <Texto nombre="caregiverEmail" type="email" error={e.caregiverEmail} autoComplete="off" />
        </Campo>
        <Campo etiqueta="Telefono" nombre="caregiverPhone">
          <Texto nombre="caregiverPhone" type="tel" autoComplete="off" />
        </Campo>
      </Seccion>

      <Seccion
        titulo="Consentimiento informado"
        descripcion="Ley 1581 de 2012 y Decreto 1377 de 2013. Datos de salud de un menor."
      >
        <Campo
          etiqueta="Quien autoriza"
          nombre="consentGuardianName"
          error={e.consentGuardianName}
          requerido
        >
          <Texto nombre="consentGuardianName" error={e.consentGuardianName} required />
        </Campo>
        <Campo etiqueta="Documento de quien autoriza" nombre="consentGuardianDocument">
          <Texto nombre="consentGuardianDocument" inputMode="numeric" />
        </Campo>
        <Campo etiqueta="Parentesco" nombre="consentRelationship">
          <Texto nombre="consentRelationship" placeholder="Madre, padre, representante" />
        </Campo>
        <Campo etiqueta="Como se otorgo" nombre="consentMethod">
          <Selector
            nombre="consentMethod"
            defaultValue="en_consulta"
            opciones={[
              { valor: 'en_consulta', texto: 'Firmado en consulta' },
              { valor: 'digital', texto: 'Aceptado digitalmente' },
            ]}
          />
        </Campo>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2.5 rounded-mml border border-borde bg-crema p-3 text-sm">
            <input
              type="checkbox"
              name="consentAccepted"
              className="mt-0.5 h-4 w-4 accent-[#e2104f]"
              required
            />
            <span className="leading-snug">
              Confirmo que el padre, madre o representante autorizo el registro y tratamiento de
              los datos de salud del menor para su seguimiento clinico, y que conoce que puede
              consultarlos, actualizarlos o solicitar su supresion.
            </span>
          </label>
          {e.consentAccepted && (
            <p className="mt-1 text-xs font-medium text-magenta">{e.consentAccepted}</p>
          )}
        </div>
      </Seccion>

      <Seccion titulo="Notas">
        <div className="sm:col-span-2">
          <Campo etiqueta="Observaciones" nombre="notes">
            <Area nombre="notes" rows={3} />
          </Campo>
        </div>
      </Seccion>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotonEnviar className="boton-magenta sm:w-auto sm:px-8">
          Crear paciente y seguir al tratamiento
        </BotonEnviar>
        <Link href="/panel" className="boton-secundario sm:w-auto">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
