import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProxyService } from '../proxy.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('albums')
export class GalleryProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAlbums(
    @Headers('authorization') auth: string,
    @Query() query: any,
  ) {
    return this.proxyService.proxyToGalleryService(
      'GET',
      '/albums',
      undefined,
      { Authorization: auth },
      query,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAlbum(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'POST',
      '/albums',
      body,
      { Authorization: auth },
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAlbum(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'GET',
      `/albums/${id}`,
      undefined,
      { Authorization: auth },
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAlbum(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'PATCH',
      `/albums/${id}`,
      body,
      { Authorization: auth },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAlbum(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'DELETE',
      `/albums/${id}`,
      undefined,
      { Authorization: auth },
    );
  }

  @Patch(':id/share')
  @UseGuards(JwtAuthGuard)
  async shareAlbum(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'PATCH',
      `/albums/${id}/share`,
      body,
      { Authorization: auth },
    );
  }

  @Get('shared/:shareToken')
  async getSharedAlbum(@Param('shareToken') shareToken: string) {
    return this.proxyService.proxyToGalleryService(
      'GET',
      `/albums/shared/${shareToken}`,
    );
  }

  // Photos endpoints
  @Post(':albumId/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('albumId') albumId: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') auth: string,
    @Req() req: Request,
  ) {
    // For file uploads, forward the multipart/form-data directly
    // We'll use the raw body and forward headers
    const FormData = require('form-data');
    const formData = new FormData();
    
    if (file) {
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }
    
    if (body.title) formData.append('title', body.title);
    if (body.description) formData.append('description', body.description);
    if (body.acquisitionDate) formData.append('acquisitionDate', body.acquisitionDate);

    return this.proxyService.proxyToGalleryService(
      'POST',
      `/albums/${albumId}/photos`,
      formData,
      {
        Authorization: auth,
        ...formData.getHeaders(),
      },
    );
  }

  @Get(':albumId/photos')
  @UseGuards(JwtAuthGuard)
  async getPhotos(
    @Param('albumId') albumId: string,
    @Query() query: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'GET',
      `/albums/${albumId}/photos`,
      undefined,
      { Authorization: auth },
      query,
    );
  }
}

@Controller('photos')
export class PhotosProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchPhotos(
    @Query() query: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'GET',
      '/photos/search',
      undefined,
      { Authorization: auth },
      query,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPhoto(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'GET',
      `/photos/${id}`,
      undefined,
      { Authorization: auth },
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePhoto(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'PATCH',
      `/photos/${id}`,
      body,
      { Authorization: auth },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToGalleryService(
      'DELETE',
      `/photos/${id}`,
      undefined,
      { Authorization: auth },
    );
  }
}
