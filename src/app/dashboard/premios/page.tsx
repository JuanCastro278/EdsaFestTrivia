
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Coins, ExternalLink } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function PremiosPage() {
    const { prizes, globalConfig } = useGame();

    return (
        <div>
            <div className="mb-8 sm:pt-6">
                <h1 className="text-3xl font-bold font-headline">Catálogo de Premios</h1>
                <p className="text-muted-foreground mt-2">¡Podrás usar tus EDSACoins para canjear increíbles premios!</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {prizes.map((prize) => (
                    <Card key={prize.id} className="flex flex-col">
                        <CardHeader className="p-0">
                           <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                                <Image
                                    src={prize.src}
                                    alt={prize.alt}
                                    fill
                                    className="object-contain"
                                    data-ai-hint={prize['data-ai-hint']}
                                />
                           </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow flex flex-col">
                           <CardTitle className="text-base flex-grow">{prize.alt}</CardTitle>
                           <div className="flex items-center gap-2 font-bold text-base text-primary my-2">
                                <Coins className="h-4 w-4" />
                                <span>{prize.cost}</span>
                            </div>
                          <CardDescription className="text-xs">{prize.description}</CardDescription>
                        </CardContent>
                         <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0">
                            {globalConfig?.prizeUrlsEnabled && prize.productUrl && (
                                <Button asChild className="w-full">
                                    <Link href={prize.productUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Ver Premio
                                    </Link>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                 {prizes.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        <p>No hay premios en el catálogo por el momento.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
