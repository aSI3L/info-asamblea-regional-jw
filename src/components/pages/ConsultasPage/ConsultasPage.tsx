"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export const consultasFormSchema = z.object({
  nombre: z.string().min(5, "Su nombre completo es obligatorio").max(30, "Ingrese un nombre válido"),
  congregacion: z.string().min(5, "Ingrese una congregación válida").max(40, "Ingrese una congregación válida"),
  numeroTelefono: z.string().regex(/^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/, "Ingrese un número de teléfono válido"),
  consulta: z.string().min(10, "Ingrese una consulta válida").max(500, "Ingrese una consulta más corta")
})

export const servicioVoluntarioFormSchema = z.object({
  nombre: z.string().min(5, "Su nombre completo es obligatorio").max(30, "Ingrese un nombre válido"),
  congregacion: z.string().min(5, "Ingrese una congregación válida").max(40, "Ingrese una congregación válida"),
  numeroTelefonoPersonal: z.string().regex(/^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/, "Ingrese un número de teléfono válido"),
  numeroTelefonoAnciano: z.string().regex(/^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/, "Ingrese un número de teléfono válido"),
  edad: z.string().regex(/^[0-9]*$/, "La edad debe ser un número entero").min(2, "Ingrese una edad válida").max(2, "Ingrese una edad válida"),
  genero: z.enum(["Masculino", "Femenino"], { message: "Seleccione un género" }),
  dias: z.array(z.enum(["Viernes", "Sábado", "Domingo"], { message: "Seleccione al menos un día"})).min(1, "Seleccione al menos un día"),
  horario: z.enum(["Mañana", "Tarde", "Indistinto"], { message: "Seleccione un horario preferido" }),
  comentarios: z.string().max(500, "Ingrese un comentario más corto").optional()
})

export function ConsultasPage() {
  const formConsultas = useForm<z.infer<typeof consultasFormSchema>>({
    resolver: zodResolver(consultasFormSchema),
    defaultValues: {
      nombre: "",
      congregacion: "",
      numeroTelefono: "",
      consulta: ""
    }
  })

  const formServicioVoluntario = useForm<z.infer<typeof servicioVoluntarioFormSchema>>({
    resolver: zodResolver(servicioVoluntarioFormSchema),
    defaultValues: {
      nombre: "",
      congregacion: "",
      numeroTelefonoPersonal: "",
      numeroTelefonoAnciano: "",
      edad: "",
      genero: undefined,
      dias: [],
      horario: undefined,
      comentarios: ""
    }
  })

  const onSubmitConsultas = async (data: z.infer<typeof consultasFormSchema>) => {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
    const chatId = process.env.NEXT_PUBLIC_CHAT_ID
    const message = `<b>Nombre</b>: ${data.nombre}\n<b>Teléfono</b>: ${data.numeroTelefono}\n<b>Consulta</b>: ${data.consulta}`;

    try {
      /*const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${data.nombre}
TEL:${data.numeroTelefono}
NOTE:Consulta: ${data.consulta.trim()}
END:VCARD`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendContact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          phone_number: `+549${data.numeroTelefono}`,
          first_name: data.nombre,
          vcard: vcard
        })
      });*/

      const inlineKeyboard = {
        inline_keyboard: [
          [{
            text: "Contactar por WhatsApp",
            url: `https://wa.me/${data.numeroTelefono}?text=${encodeURIComponent(`Hola ${data.nombre}! Te contacto del departamento de información de la asamblea regional. Nos hiciste esta consulta: "${data.consulta}".`)}`
          }]
        ]
      };

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        })
      });

      if (response.ok) {
        formConsultas.reset();
      } else {
        const error = await response.json();
        console.error('Error al enviar el mensaje:', error);
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const onSubmitServicioVoluntario = async (data: z.infer<typeof servicioVoluntarioFormSchema>) => {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_CHAT_ID;
    const message = `<b>Nombre</b>: ${data.nombre}\n<b>Congregación</b>: ${data.congregacion}\n<b>Número de Teléfono Personal</b>: ${data.numeroTelefonoPersonal}\n<b>Número de Teléfono del Anciano</b>: ${data.numeroTelefonoAnciano}\n<b>Edad</b>: ${data.edad}\n<b>Género</b>: ${data.genero}\n<b>Días Disponibles</b>: ${data.dias.join(', ')}\n<b>Horario Preferido</b>: ${data.horario}\n<b>Comentarios</b>: ${data.comentarios || "Ninguno"}`;
    const inlineKeyboard = {
      inline_keyboard: [
        [{
          text: "Contactar al hermano por WhatsApp",
          url: `https://wa.me/${data.numeroTelefonoPersonal}?text=${encodeURIComponent(`Hola ${data.nombre}! Te contacto porque llenaste el formulario de servicio voluntario para la asamblea regional.`)}`
        }],
        [{
          text: "Contactar al Anciano por WhatsApp",
          url: `https://wa.me/${data.numeroTelefonoAnciano}?text=${encodeURIComponent(`Hola! Te contacto porque ${data.nombre} de la congregación ${data.congregacion} llenó el formulario de servicio voluntario y dejó tu número como anciano de su congregación.`)}`
        }]
      ]
    };
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        })
      });

      if (response.ok) {
        formServicioVoluntario.reset();
      } else {
        const error = await response.json();
        console.error('Error al enviar el mensaje:', error);
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <main className="min-h-screen bg-primaryColor">
      <div className="flex flex-col items-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-secondaryColor">Consultas</h3>
          <p className="text-secondaryColor-80 text-lg max-w-3xl mx-auto">Llene el formulario con su consulta para que un hermano encargado se comunique con usted</p>
        </div>
        <div>
          <Tabs defaultValue="consultas" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="consultas">Consultas</TabsTrigger>
              <TabsTrigger value="voluntario">Servicio Voluntario</TabsTrigger>
            </TabsList>
            <TabsContent value="consultas">
              <Card>
                <CardHeader>
                  <CardTitle>Formulario de Consultas</CardTitle>
                  <CardDescription>Complete el formulario y a la brevedad un hermano del departamento de informes se comunicará con usted</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...formConsultas}>
                    <form onSubmit={formConsultas.handleSubmit(onSubmitConsultas)} className="space-y-5">
                      <FormField
                        control={formConsultas.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Perez" {...field}/>
                            </FormControl>
                            {formConsultas.formState.errors.nombre && <FormMessage>{formConsultas.formState.errors.nombre.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formConsultas.control}
                        name="congregacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Congregación</FormLabel>
                            <FormControl>
                              <Input placeholder="Oeste Dorrego" {...field}/>
                            </FormControl>
                            {formConsultas.formState.errors.congregacion && <FormMessage>{formConsultas.formState.errors.congregacion.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formConsultas.control}
                        name="numeroTelefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="261..." {...field}/>
                            </FormControl>
                            {formConsultas.formState.errors.numeroTelefono && <FormMessage>{formConsultas.formState.errors.numeroTelefono.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formConsultas.control}
                        name="consulta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consulta</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Ingrese su consulta..." maxLength={500} {...field}/>
                            </FormControl>
                            {formConsultas.formState.errors.consulta && <FormMessage>{formConsultas.formState.errors.consulta.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <Button className="cursor-pointer w-24" type="submit"disabled={formConsultas.formState.isSubmitting}>{formConsultas.formState.isSubmitting ? "Enviando..." : "Enviar"}</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="voluntario">
              <Card>
                <CardHeader>
                  <CardTitle>Formulario de Servicio Voluntario</CardTitle>
                  <CardDescription>Complete el formulario y a la brevedad un hermano del departamento de servicio voluntario se comunicará con usted para coordinar en que área puede colaborar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...formServicioVoluntario}>
                    <form onSubmit={formServicioVoluntario.handleSubmit(onSubmitServicioVoluntario)} className="space-y-5">
                      <FormField
                        control={formServicioVoluntario.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Perez" {...field}/>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.nombre && <FormMessage>{formServicioVoluntario.formState.errors.nombre.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="congregacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Congregación</FormLabel>
                            <FormControl>
                              <Input placeholder="Oeste Dorrego" {...field}/>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.congregacion && <FormMessage>{formServicioVoluntario.formState.errors.congregacion.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="numeroTelefonoPersonal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono Personal</FormLabel>
                            <FormControl>
                              <Input placeholder="261..." {...field}/>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.numeroTelefonoPersonal && <FormMessage>{formServicioVoluntario.formState.errors.numeroTelefonoPersonal.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="numeroTelefonoAnciano"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono de un Anciano de su Congregación</FormLabel>
                            <FormControl>
                              <Input placeholder="261..." {...field}/>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.numeroTelefonoAnciano && <FormMessage>{formServicioVoluntario.formState.errors.numeroTelefonoAnciano.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="edad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Edad</FormLabel>
                            <FormControl>
                              <Input placeholder="18" {...field}/>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.edad && <FormMessage>{formServicioVoluntario.formState.errors.edad.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="genero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Género</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem value="Masculino"/>
                                  </FormControl>
                                  <FormLabel>Masculino</FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem value="Femenino"/>
                                  </FormControl>
                                  <FormLabel>Femenino</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.genero && <FormMessage>{formServicioVoluntario.formState.errors.genero.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="dias"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Días Disponibles (seleccione 1 o más)</FormLabel>
                            <FormField
                              control={formServicioVoluntario.control}
                              name="dias"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, "Viernes"]) : field.onChange(field.value.filter((value) => value !== "Viernes"));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel>Viernes</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={formServicioVoluntario.control}
                              name="dias"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, "Sábado"]) : field.onChange(field.value.filter((value) => value !== "Sábado"));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel>Sábado</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={formServicioVoluntario.control}
                              name="dias"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, "Domingo"]) : field.onChange(field.value.filter((value) => value !== "Domingo"));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel>Domingo</FormLabel>
                                </FormItem>
                              )}
                            />
                            {formServicioVoluntario.formState.errors.dias && <FormMessage>{formServicioVoluntario.formState.errors.dias.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="horario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horario Preferido</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value}>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem value="Mañana"/>
                                  </FormControl>
                                  <FormLabel>Mañana</FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem value="Tarde"/>
                                  </FormControl>
                                  <FormLabel>Tarde</FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem value="Indistinto"/>
                                  </FormControl>
                                  <FormLabel>Indistinto</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.horario && <FormMessage>{formServicioVoluntario.formState.errors.horario.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formServicioVoluntario.control}
                        name="comentarios"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comentarios Adicionales (opcional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Ingrese sus comentarios..." maxLength={500} {...field}/>
                            </FormControl>
                            {formServicioVoluntario.formState.errors.comentarios && <FormMessage>{formServicioVoluntario.formState.errors.comentarios.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                      <Button className="cursor-pointer w-24" type="submit" disabled={formServicioVoluntario.formState.isSubmitting}>{formServicioVoluntario.formState.isSubmitting ? "Enviando..." : "Enviar"}</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
        </div>
      </div>
    </main>
  )
}
