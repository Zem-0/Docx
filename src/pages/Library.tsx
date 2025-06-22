import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileObject } from '@supabase/storage-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Eye, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const Library = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<FileObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [docToDelete, setDocToDelete] = useState<FileObject | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data, error } = await supabase.storage.from('documents').list(user.id, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

                if (error) {
                    throw error;
                }

                if (data) {
                    setDocuments(data);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [user]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleView = async (doc: FileObject) => {
        if (!user) return;
        const filePath = `${user.id}/${doc.name}`;
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 60); // 60 seconds validity

        if (error) {
            toast({ title: "Error", description: "Could not create a view link.", variant: "destructive" });
            return;
        }
        if (data) {
            window.open(data.signedUrl, '_blank');
        }
    };

    const handleDownload = async (doc: FileObject) => {
        if (!user) return;
        const filePath = `${user.id}/${doc.name}`;
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 60, {
                download: doc.name,
            });

        if (error) {
            toast({ title: "Error", description: "Could not create a download link.", variant: "destructive" });
            return;
        }
        if (data) {
            window.open(data.signedUrl, '_self');
        }
    };

    const handleDelete = async () => {
        if (!docToDelete || !user) return;
        const filePath = `${user.id}/${docToDelete.name}`;

        const { error } = await supabase.storage.from('documents').remove([filePath]);

        if (error) {
            toast({ title: "Error", description: `Could not delete ${docToDelete.name}.`, variant: "destructive" });
        } else {
            setDocuments(documents.filter(d => d.id !== docToDelete.id));
            toast({ title: "Success", description: `${docToDelete.name} has been deleted.` });
        }
        setDocToDelete(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>My Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Last Modified</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{doc.metadata.mimetype}</Badge>
                                        </TableCell>
                                        <TableCell>{formatBytes(doc.metadata.size)}</TableCell>
                                        <TableCell>{doc.updated_at ? format(new Date(doc.updated_at), 'PPP') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(doc)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDocToDelete(doc)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        You have not uploaded any documents yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <AlertDialog open={docToDelete !== null} onOpenChange={() => setDocToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the document
                            "{docToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

const LibraryPageContainer = () => {
    return (
        <DashboardLayout>
            <Library />
        </DashboardLayout>
    );
};

export default LibraryPageContainer; 