import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    // If token is provided, get specific proposal by share token
    if (token) {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('share_token', token)
        .single();

      if (error || !proposal) {
        return NextResponse.json(
          { error: 'Proposal not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ proposal });
    }

    // If id is provided, get specific proposal by ID (admin only)
    if (id) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: proposal, error } = await supabaseAdmin
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !proposal) {
        return NextResponse.json(
          { error: 'Proposal not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ proposal });
    }

    // List all proposals (admin only)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch proposals' },
        { status: 500 }
      );
    }

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Proposals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin only
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Get proposal to delete file from storage
    const { data: proposal, error: fetchError } = await supabaseAdmin
      .from('proposals')
      .select('file_name')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Delete from storage
    if (proposal?.file_name) {
      await supabaseAdmin.storage
        .from('proposals')
        .remove([proposal.file_name]);
    }

    // Delete from database (cascades to related tables)
    const { error: deleteError } = await supabaseAdmin
      .from('proposals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting proposal:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete proposal' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}