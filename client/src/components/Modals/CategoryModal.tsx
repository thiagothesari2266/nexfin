import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertCategorySchema, type InsertCategory, type Category } from "@shared/schema";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
  category?: Category | null;
}

const categoryIcons = [
  { value: "🍽️", label: "Alimentação" },
  { value: "🚗", label: "Transporte" },
  { value: "🏠", label: "Moradia" },
  { value: "💰", label: "Salário" },
  { value: "💻", label: "Freelance" },
  { value: "🎯", label: "Lazer" },
  { value: "👕", label: "Roupas" },
  { value: "🏥", label: "Saúde" },
  { value: "📚", label: "Educação" },
  { value: "⚡", label: "Utilidades" },
  { value: "🛒", label: "Compras" },
  { value: "🎬", label: "Entretenimento" },
  { value: "✈️", label: "Viagens" },
  { value: "💡", label: "Outros" }
];

const categoryColors = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"
];

export default function CategoryModal({ isOpen, onClose, accountId, category }: CategoryModalProps) {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(category?.color || categoryColors[0]);
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || categoryIcons[0].value);
  const [selectedType, setSelectedType] = useState<"income" | "expense">(category?.type || "expense");

  const createMutation = useCreateCategory(accountId);
  const updateMutation = useUpdateCategory();

  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "expense",
      color: category?.color || categoryColors[0],
      icon: category?.icon || categoryIcons[0].value,
      accountId: accountId,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        accountId: accountId,
      });
      setSelectedColor(category.color);
      setSelectedIcon(category.icon);
      setSelectedType(category.type);
    } else {
      form.reset({
        name: "",
        type: "expense",
        color: categoryColors[0],
        icon: categoryIcons[0].value,
        accountId: accountId,
      });
      setSelectedColor(categoryColors[0]);
      setSelectedIcon(categoryIcons[0].value);
      setSelectedType("expense");
    }
  }, [category, accountId, form]);

  const onSubmit = async (data: InsertCategory) => {
    const categoryData = {
      ...data,
      color: selectedColor,
      icon: selectedIcon,
      type: selectedType,
      accountId: accountId,
    };

    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, ...categoryData });
        toast({
          title: "Categoria atualizada!",
          description: `A categoria "${data.name}" foi atualizada com sucesso.`,
        });
      } else {
        await createMutation.mutateAsync(categoryData);
        toast({
          title: "Categoria criada!",
          description: `A categoria "${data.name}" foi criada com sucesso.`,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: category ? "Não foi possível atualizar a categoria." : "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {category ? "Atualize as informações da categoria." : "Crie uma nova categoria para organizar suas transações."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentação" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={(value: "income" | "expense") => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                <SelectTrigger>
                  <SelectValue>
                    <span className="flex items-center space-x-2">
                      <span>{selectedIcon}</span>
                      <span>{categoryIcons.find(icon => icon.value === selectedIcon)?.label}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categoryIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <span className="flex items-center space-x-2">
                        <span>{icon.value}</span>
                        <span>{icon.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="grid grid-cols-8 gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : category ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}