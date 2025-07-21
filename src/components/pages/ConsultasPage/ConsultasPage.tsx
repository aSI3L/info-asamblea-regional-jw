"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const consultasFormSchema = z.object({
  nombre: z.string().min(5, "Su nombre completo es obligatorio").max(30, "Ingrese un nombre válido"),
  numeroTelefono: z.string().regex(/^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/, "Ingrese un número de teléfono válido"),
  consulta: z.string().min(10, "Ingrese una consulta válida").max(500, "Ingrese una consulta más corta")
})

export function ConsultasPage() {
  const form = useForm<z.infer<typeof consultasFormSchema>>({
    resolver: zodResolver(consultasFormSchema),
    defaultValues: {
      nombre: "",
      numeroTelefono: "",
      consulta: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof consultasFormSchema>) => {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
    const chatId = process.env.NEXT_PUBLIC_CHAT_ID
    const message = `*Nombre:* ${data.nombre}

*Número de Teléfono:* ${data.numeroTelefono}

*Consulta:* ${data.consulta}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=Markdown`);

      /*const response2 = await fetch(`https://api.telegram.org/bot${botToken}/sendContact?chat_id=${chatId}&phone_number=${data.numeroTelefono}&first_name=${data.nombre}`*/

      if (response.ok) {
        form.reset();
      } else {
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // TODO: Mejorar visualmente.
  return (
    <main className="min-h-screen bg-primaryColor">
      <div className="flex flex-col items-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-secondaryColor">Consultas</h3>
          <p className="text-secondaryColor-80 text-lg max-w-3xl mx-auto">Llene el formulario con su consulta para que un hermano encargado se comunique con usted</p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Perez" {...field}/>
                    </FormControl>
                    {form.formState.errors.nombre && <FormMessage>{form.formState.errors.nombre.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroTelefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="261..." {...field}/>
                    </FormControl>
                    {form.formState.errors.numeroTelefono && <FormMessage>{form.formState.errors.numeroTelefono.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consulta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consulta</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ingrese su consulta..." maxLength={500} {...field}/>
                    </FormControl>
                    {form.formState.errors.consulta && <FormMessage>{form.formState.errors.consulta.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <Button className="cursor-pointer w-24" type="submit"disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Enviando..." : "Enviar"}</Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}
