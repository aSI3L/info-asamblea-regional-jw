import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types/category.type";

interface CategoryCardProps {
    category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 md:hover:shadow-2xl md:cursor-pointer">
            <CardContent className="p-0">
                <div className="relative h-64 md:h-72 lg:h-80">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                        backgroundImage: `url('${category.backgroundImage}')`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-secondaryColor/90 via-secondaryColor/50 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-primaryColor">
                        <h3 className="text-lg md:text-xl font-bold pb-2 leading-tight">{category.title}</h3>
                        <p className="text-sm md:text-base leading-relaxed">{category.description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}