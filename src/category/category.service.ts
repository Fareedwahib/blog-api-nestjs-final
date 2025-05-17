import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Generate slug if not provided
    if (!createCategoryDto.slug) {
      createCategoryDto.slug = slugify(createCategoryDto.name, { lower: true });
    }

    // Check if slug already exists
    const existingCategory = await this.categoryModel.findOne({ slug: createCategoryDto.slug });
    if (existingCategory) {
      throw new ConflictException(`Category with slug '${createCategoryDto.slug}' already exists`);
    }

    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // If slug is being updated, check if new slug already exists
    if (updateCategoryDto.slug) {
      const existingCategory = await this.categoryModel.findOne({ 
        slug: updateCategoryDto.slug,
        _id: { $ne: id } // exclude current category
      });
      
      if (existingCategory) {
        throw new ConflictException(`Category with slug '${updateCategoryDto.slug}' already exists`);
      }
    }
    
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
      
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}