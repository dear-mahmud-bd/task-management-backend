import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface UserDocument extends User, Document {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    enum: ['developer', 'admin', 'manager'],
    default: 'developer',
  })
  role: 'developer' | 'admin' | 'manager';

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }] })
  tasks: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ✅ Add this method on schema.methods (NOT in the class)
UserSchema.methods.matchPassword = async function (
  this: UserDocument, // 👈 Fixes 'this is any'
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password); // now properly typed
};

// ✅ Hash password before save
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
