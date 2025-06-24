"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Camera, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import AvatarEditor from "react-avatar-editor";

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onImageChange?: (file: File) => void;
  className?: string;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  firstName,
  lastName,
  onImageChange,
  className = "",
}: ProfilePictureUploadProps) {
  // Avatar editor states
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [scale, setScale] = useState([1]);
  const [rotate, setRotate] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<AvatarEditor>(null);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update preview URL when currentImageUrl changes
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedImage(file);
      setScale([1]);
      setRotate(0);
      setShowEditor(true);
    }
  };

  const handleSaveEditedImage = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const editedFile = new File([blob], selectedImage?.name || 'profile-picture.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Clean up old preview URL
          if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }

          const url = URL.createObjectURL(editedFile);
          setPreviewUrl(url);

          // Call the callback with the edited file
          onImageChange?.(editedFile);
        }
      }, 'image/jpeg', 0.9);
    }

    setShowEditor(false);
    setSelectedImage(null);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setSelectedImage(null);
    setScale([1]);
    setRotate(0);
  };

  // Avatar Editor Content Component
  const AvatarEditorContent = () => (
    <div className="space-y-4">
      <div className="flex justify-center">
        {selectedImage && (
          <AvatarEditor
            ref={editorRef}
            image={selectedImage}
            width={250}
            height={250}
            border={0}
            borderRadius={125}
            color={[0, 0, 0, 0.6]}
            scale={scale[0]}
            rotate={rotate}
            className="border border-border"
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScale([Math.max(1, scale[0] - 0.2)])}
            disabled={scale[0] <= 1}
            className="gap-2 flex-1"
          >
            <ZoomOut className="w-4 h-4" />
            Zoom Out
          </Button>
          <span className="text-sm text-muted-foreground min-w-12 text-center">
            {scale[0].toFixed(1)}x
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScale([Math.min(3, scale[0] + 0.2)])}
            disabled={scale[0] >= 3}
            className="gap-2 flex-1"
          >
            <ZoomIn className="w-4 h-4" />
            Zoom In
          </Button>
        </div>

        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRotate(rotate - 90)}
            className="gap-2 flex-1"
          >
            <RotateCw className="w-4 h-4 scale-x-[-1]" />
            Rotate Left
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRotate(rotate + 90)}
            className="gap-2 flex-1"
          >
            <RotateCw className="w-4 h-4" />
            Rotate Right
          </Button>
        </div>
      </div>

      <div className={`flex gap-2 pt-4 ${isMobile ? 'flex-col' : 'justify-end'}`}>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelEdit}
          className={isMobile ? 'w-full' : ''}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveEditedImage}
          className={`gap-2 ${isMobile ? 'w-full order-first' : ''}`}
        >
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`flex items-center gap-6 ${className}`}>
        <Avatar className="size-14">
          <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            Change Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG up to 5MB
          </p>
        </div>
      </div>

      {/* Avatar Editor Modal - Desktop */}
      {!isMobile && (
        <Dialog open={showEditor && selectedImage !== null} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile Picture</DialogTitle>
            </DialogHeader>
            <AvatarEditorContent />
          </DialogContent>
        </Dialog>
      )}

      {/* Avatar Editor Modal - Mobile */}
      {isMobile && (
        <Drawer open={showEditor && selectedImage !== null} onOpenChange={setShowEditor} dismissible={false} shouldScaleBackground={true}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Edit Profile Picture</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <AvatarEditorContent />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
} 